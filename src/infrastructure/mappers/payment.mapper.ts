import { PaymentModel } from "@src/domain/models/payment.model";
import { PaymentEntity } from "@src/infrastructure/adapters/entities/payment.entity";

import { ProviderMapper } from "./provider.mapper";
import { ScheduleMapper } from "./schedule.mapper";
import { TenantMapper } from "./tenant.mapper";

export class PaymentMapper {
  public static toDomain(entity: PaymentEntity): PaymentModel {
    const payment = new PaymentModel(
      entity.id,
      entity.amount,
      entity.payment_date,
      entity.metadata,
      entity.payment_split,
      entity.base_payment,
      entity.discount,
      entity.discount_type,
      entity.status,
    );
    if (entity.tenant) {
      payment.tenant = TenantMapper.toDomain(entity.tenant);
    }
    if (entity.schedules) {
      payment.schedules = entity.schedules.map(schedule =>
        ScheduleMapper.toDomain(schedule),
      );
    }
    if (entity.provider) {
      payment.provider = ProviderMapper.toDomain(entity.provider);
    }
    return payment;
  }
}
