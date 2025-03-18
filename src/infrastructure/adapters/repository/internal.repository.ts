import { Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Repository } from "typeorm";
// eslint-disable-next-line node/no-extraneous-import
import { v4 as uuidv4 } from "uuid";

import { PaymentStatus } from "@src/domain/types/payment-status.type";
import {
  AlertType,
  EventType,
  WebhookResponseDto,
} from "@src/infrastructure/providers/payment/dto/webhook-response.dto";
import { LawPayWebhookDto } from "@src/infrastructure/providers/payment/implementations/LawPay/dto/webhook.dto";
import { LawPayProvider } from "@src/infrastructure/providers/payment/implementations/LawPay/lawpay.provider";

import { EventEntity } from "../entities/event.entity";
import { EventTypeEntity } from "../entities/event-type.entity";
import { InvoiceEntity } from "../entities/invoice.entity";
import { PaymentEntity } from "../entities/payment.entity";

export class InternalRepository {
  private readonly logger = new Logger(InternalRepository.name);
  constructor(
    private readonly lawPayProvider: LawPayProvider,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(EventTypeEntity)
    private readonly eventTypeRepository: Repository<EventTypeEntity>,
  ) {}
  async processWebhook(event: unknown, provider: string): Promise<void> {
    this.logger.log("Processing Webhook");
    let webhook_response: WebhookResponseDto;
    switch (provider) {
      case "LAWPAY": {
        this.logger.log("Processing LawPay Webhook");
        webhook_response = this.lawPayProvider.processWebhook(
          event as LawPayWebhookDto,
        );
        switch (webhook_response.type) {
          case EventType.STATUS_UPDATE: {
            this.logger.log("Processing payment Status Update");
            const payment = await this.paymentRepository.findOne({
              where: { id: webhook_response.payment_id },
              relations: [
                "schedules",
                "schedules.invoices",
                "tenant",
                "provider",
              ],
            });
            if (!payment) {
              this.logger.error(
                webhook_response,
                "Payment not found for webhook event",
              );
              throw new NotFoundException(
                "Payment not found for webhook event",
              );
            }
            const schedule = payment.schedules.find(sch => {
              const schedule_month = sch.schedule_date.getMonth();
              const schedule_year = sch.schedule_date.getFullYear();
              const webhook_month = webhook_response.created.getMonth();
              const webhook_year = webhook_response.created.getFullYear();
              return (
                schedule_month === webhook_month &&
                schedule_year === webhook_year
              );
            });
            if (!schedule) {
              this.logger.error(
                webhook_response,
                "Schedule not found for webhook event",
              );
              throw new NotFoundException(
                "Schedule not found for webhook event",
              );
            }
            this.logger.log("Creating invoice for schedule");
            const invoice = this.invoiceRepository.create({
              id: uuidv4(),
              transaction_id: webhook_response.object_id,
              status: webhook_response.status,
              amount: schedule.amount,
              schedule: schedule,
            });
            await this.invoiceRepository.save(invoice);
            schedule.invoices.push(invoice);
            schedule.status = webhook_response.status;
            const all_payments_completed = payment.schedules.every(
              sch => sch.status === PaymentStatus.COMPLETED,
            );
            if (all_payments_completed) {
              payment.status = PaymentStatus.COMPLETED;
            }
            this.logger.log("Saving updates in payment");
            await this.paymentRepository.save(payment);

            this.logger.log("Searching events for active webhook");
            const tenant_id = payment.tenant.id;
            const provider_id = payment.provider.id;

            const event_types = await this.eventTypeRepository.findOne({
              where: {
                name: webhook_response.type,
                providers: [{ id: provider_id }],
                events: [{ tenant: { id: tenant_id } }],
              },
              relations: ["events", "providers", "events.tenant"],
            });
            if (event_types) {
              const events = event_types.events;
              if (events.length > 0) {
                this.logger.log("Sending webhook events");
                const events_result = await Promise.all(
                  events.map((event: EventEntity) =>
                    axios.post(
                      `${event.domain}/${event.path}`,
                      webhook_response,
                    ),
                  ),
                );
                if (events_result.every(result => result.status === 200)) {
                  this.logger.log("Webhook events sended with success");
                } else {
                  this.logger.error(
                    events_result,
                    "Error sending webhook events",
                  );
                }
              }
            }
            break;
          }
          case EventType.TRANSACTION_ALERT: {
            switch (webhook_response.alert_type) {
              case AlertType.PAYMENT_METHOD_EXPIRING: {
                this.logger.log("Payment method expiring alert");
                break;
              }
            }
          }
        }
      }
    }
  }
}
