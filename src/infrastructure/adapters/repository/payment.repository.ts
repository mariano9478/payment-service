import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// eslint-disable-next-line node/no-extraneous-import
import { v4 as uuidv4 } from "uuid";

import { CaptureDto } from "@src/domain/dtos/in/payment-capture.dto";
import { BaseResponseDto } from "@src/domain/dtos/out/base-response.dto";
import { PaymentModel } from "@src/domain/models/payment.model";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";
import { PaymentStatus } from "@src/domain/types/payment-status.type";
import { PaymentMapper } from "@src/infrastructure/mappers/payment.mapper";
import { PaymentOrchestrator } from "@src/infrastructure/providers/payment/payment-orchestrator";

import { InvoiceEntity } from "../entities/invoice.entity";
import { MethodEntity } from "../entities/method.entity";
import { PaymentEntity } from "../entities/payment.entity";
import { ScheduleEntity } from "../entities/schedule.entity";

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  private readonly logger = new Logger(PaymentRepository.name);
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(MethodEntity)
    private readonly methodRepository: Repository<MethodEntity>,
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    private readonly paymentOrchestrator: PaymentOrchestrator,
  ) {}
  async createPayment(config: PaymentModel): Promise<PaymentModel> {
    this.logger.log("Creating payment in database");
    const payment = this.paymentRepository.create(config);
    await this.paymentRepository.save(payment);
    this.logger.log("Payment created in database");
    return config;
  }
  async getPaymentById(
    id: string,
    relations?: string[],
  ): Promise<PaymentModel> {
    this.logger.log("Getting payment from database");
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: relations,
    });
    if (!payment) throw new NotFoundException("Payment not found");
    this.logger.log("Payment retrieved from database");
    return PaymentMapper.toDomain(payment);
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<PaymentModel> {
    this.logger.log("Getting payment from database");
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException("Payment not found");
    this.logger.log("Updating payment status in database");
    payment.status = status;
    await this.paymentRepository.save(payment);
    this.logger.log("Payment status updated in database");
    return PaymentMapper.toDomain(payment);
  }

  async refund(id: string): Promise<PaymentModel> {
    this.logger.log("Getting payment from database");
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ["schedules"],
    });

    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status === PaymentStatus.REFUNDED)
      return PaymentMapper.toDomain(payment);

    payment.schedules = payment.schedules.filter(
      schedule => schedule.status === PaymentStatus.COMPLETED,
    );
    const invoices = payment.schedules.flatMap(schedule => schedule.invoices);

    this.logger.log("Getting payment provider instance");
    const provider = this.paymentOrchestrator.getProvider(
      "LAWPAY",
      "TEST_TENANT",
    );
    this.logger.log("Refunding payment in provider");
    const promises = invoices.map(invoice => {
      if (invoice.status === PaymentStatus.COMPLETED)
        return provider.refundCharge(invoice.transaction_id);
    });
    await Promise.all(promises)
      .then(() => this.logger.log("Payment refunded in provider"))
      .catch(error => {
        this.logger.error(error);
        throw new Error("Error refunding payment in provider");
      });
    this.logger.log("Refunding payment in database");

    payment.status = PaymentStatus.REFUNDED;
    for (const sch of payment.schedules) {
      sch.status = PaymentStatus.REFUNDED;
      for (const inv of sch.invoices) {
        inv.status = PaymentStatus.REFUNDED;
      }
    }

    await this.paymentRepository.save(payment);
    this.logger.log("Payment refunded in database");
    return PaymentMapper.toDomain(payment);
  }

  async capturePayment(
    id: string,
    capture: CaptureDto,
  ): Promise<BaseResponseDto> {
    let method_errors = "";
    this.logger.log("Getting payment from database");
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ["schedules", "methods", "tenant", "provider"],
    });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status === PaymentStatus.COMPLETED)
      throw new BadRequestException("Payment already captured");
    if (payment.status === PaymentStatus.REFUNDED)
      throw new BadRequestException("Payment has been refunded");
    if (payment.status === PaymentStatus.IN_PROGRESS)
      throw new BadRequestException("Payment is in progress");

    this.logger.log("Getting payment provider instance");
    const provider = this.paymentOrchestrator.getProvider(
      payment.provider.name,
      payment.tenant.name,
    );
    if (!provider) throw new NotFoundException("Provider not found");
    this.logger.log("Creating client on provider");
    let client_id = payment.external_id ?? "";
    if (!payment.external_id) {
      try {
        const client_ = await provider.createClient({
          first_name: capture.client_first_name,
          last_name: capture.client_last_name,
          email: capture.client_email,
        });
        if (!client_.id) throw new Error("Error creating client in provider");
        client_id = client_.id;
        payment.external_id = client_id;
        await this.paymentRepository.save(payment);
        this.logger.log("Client created in provider");
      } catch (error) {
        this.logger.error(error);
        throw new Error("Error creating client in provider");
      }
    }
    this.logger.log("Adding payment method to client in provider");
    try {
      const method = await provider.addClientPaymentMethod(client_id, {
        token: capture.method_token,
        type: capture.method_type,
      });
      this.logger.log("Saving client and payment method in database");
      payment.methods.map(m => {
        if (m.status === "active") m.status = "inactive";
      });
      const uuid = uuidv4();
      const db_method = this.methodRepository.create({
        id: uuid,
        token: method,
        method_type: capture.method_type,
        status: "active",
        payment: payment,
      });
      payment.methods.push(db_method);
      await this.methodRepository.save(payment.methods);
      this.logger.log("Payment method added to client in provider");
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        this.logger.error(error);
        throw new Error("Error adding payment method to client in provider");
      }
      method_errors = error.message;
    }
    this.logger.log("Checking if payment has pending schedules");
    let charge;
    if (method_errors === "") {
      try {
        this.logger.log("Checking if pending schedules for current month");
        charge = await this.evaluatePayment(payment);
        this.logger.log("Charge created in provider");
        this.logger.log("Setting payment to in progress");
        payment.status = PaymentStatus.IN_PROGRESS;
        await this.paymentRepository.save(payment);
      } catch (error) {
        this.logger.error(error);
        throw new Error("Error creating charge in provider");
      }
    }

    return {
      transaction_id: payment.id,
      status: method_errors === "" ? "SUCCESS" : "ERROR",
      data: {
        method: method_errors === "" ? "SAVED" : "ERROR",
        method_errors,
        client: "SAVED",
        charge,
      },
    };
  }

  async createCharge(id: string): Promise<BaseResponseDto> {
    this.logger.log("Getting payment from database");
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        "schedules",
        "methods",
        "tenant",
        "provider",
        "schedules.invoices",
      ],
    });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status === PaymentStatus.REFUNDED)
      throw new BadRequestException("Payment has been refunded");
    if (payment.status === PaymentStatus.COMPLETED)
      throw new BadRequestException("Payment already completed");

    this.logger.log("Evaluating payment");
    const charge = await this.evaluatePayment(payment);
    if (!charge) throw new Error("No charge created");
    if (payment.status !== PaymentStatus.IN_PROGRESS) {
      payment.status = PaymentStatus.IN_PROGRESS;
      await this.paymentRepository.save(payment);
    }
    return {
      transaction_id: payment.id,
      status: "SUCCESS",
      data: charge,
    };
  }

  async getPendingPayments(): Promise<PaymentModel[]> {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const payments = await this.paymentRepository
      .createQueryBuilder("payment")
      .innerJoinAndSelect("payment.schedules", "schedule")
      .where("MONTH(schedule.schedule_date) = :month", {
        month: currentMonth,
      })
      .andWhere("YEAR(schedule.schedule_date) = :year", {
        year: currentYear,
      })
      .getMany();
    return payments.map(p => PaymentMapper.toDomain(p));
  }

  private async evaluatePayment(payment: PaymentEntity) {
    const provider = this.paymentOrchestrator.getProvider(
      payment.provider.name,
      payment.tenant.name,
    );
    const method = payment.methods.find(m => m.status === "active");
    if (!method) throw new Error("No active payment method found");
    const today = new Date();
    const schedule = payment.schedules.find(sch => {
      const schedule_month = sch.schedule_date.getMonth();
      const schedule_year = sch.schedule_date.getFullYear();
      const webhook_month = today.getMonth();
      const webhook_year = today.getFullYear();
      return schedule_month === webhook_month && schedule_year === webhook_year;
    });
    let created_charge;
    if (schedule) {
      this.logger.log("Schedule found to be charged");
      this.logger.log("Creating charge in provider");
      const charge = await provider.createCharge({
        amount: schedule.amount,
        method: method.token,
        method_type: method.method_type,
        reference: {
          schedule_id: schedule.id,
          data: payment.metadata,
        },
      });
      const invoice = this.invoiceRepository.create({
        id: uuidv4(),
        transaction_id: charge.transaction_id,
        status: PaymentStatus.CREATED,
        amount: charge.data?.amount as number,
        schedule: schedule,
      });
      schedule.invoices.push(invoice);
      await this.invoiceRepository.save(invoice);
      schedule.status = PaymentStatus.AUTHORIZED;
      await this.scheduleRepository.save(schedule);
      created_charge = {
        amount: charge.data?.amount as number,
        status: charge.status,
        charge_id: charge.transaction_id,
        schedule_id: schedule.id,
      };
      this.logger.log("Charge created in provider");
    } else {
      this.logger.log("No schedules founded for current month");
    }
    return created_charge;
  }
}
