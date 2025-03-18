import { Inject } from "@nestjs/common";
// eslint-disable-next-line node/no-extraneous-import
import { v4 as uuidv4 } from "uuid";

import { PaymentIntentDto } from "@src/domain/dtos/in/payment-intent.dto";
import { PaymentModel } from "@src/domain/models/payment.model";
import { ProviderModel } from "@src/domain/models/provider.model";
import { ScheduleModel } from "@src/domain/models/schedule.model";
import { TenantModel } from "@src/domain/models/tenant.model";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";
import { PaymentStatus } from "@src/domain/types/payment-status.type";

export class CreatePaymentUseCase {
  constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  public async handle(config: PaymentIntentDto): Promise<PaymentModel> {
    const amount =
      config.discount_type === "percentage"
        ? config.amount - config.amount * (config.discount / 100)
        : config.amount - config.discount;
    const split_amount =
      config.base_payment > 0
        ? (amount - config.base_payment) / config.payment_split
        : amount / config.payment_split;
    const payment_splits: ScheduleModel[] = [];

    if (config.base_payment > 0) {
      const uuid: string = uuidv4();
      payment_splits.push(
        new ScheduleModel(
          uuid,
          config.payment_date,
          config.base_payment,
          PaymentStatus.PENDING,
        ),
      );
    }
    const split_start_date = config.base_payment > 0 ? 1 : 0;
    for (
      let i = split_start_date;
      i < config.payment_split + split_start_date;
      i++
    ) {
      const split_date = new Date(
        config.payment_date.getFullYear(),
        config.payment_date.getMonth() + i,
        config.payment_date.getDate(),
      );
      const uuid: string = uuidv4();
      payment_splits.push(
        new ScheduleModel(
          uuid,
          split_date,
          split_amount,
          PaymentStatus.PENDING,
        ),
      );
    }
    const payment_uuid = uuidv4();
    const payment = new PaymentModel(
      payment_uuid,
      config.amount,
      config.payment_date,
      config.metadata,
      config.payment_split,
      config.base_payment,
      config.discount,
      config.discount_type,
      PaymentStatus.PENDING,
    );
    payment.tenant = new TenantModel(config.tenant.id, config.tenant.name);
    payment.provider = new ProviderModel(
      config.provider.id,
      config.provider.name,
    );
    payment.schedules = payment_splits;
    return await this.paymentRepository.createPayment(payment);
  }
}
