import { ScheduleModel } from "@src/domain/models/schedule.model";

import { ScheduleEntity } from "../adapters/entities/schedule.entity";
import { InvoiceMapper } from "./invoice.mapper";

export class ScheduleMapper {
  public static toDomain(entity: ScheduleEntity): ScheduleModel {
    const schedule = new ScheduleModel(
      entity.id,
      entity.schedule_date,
      entity.amount,
      entity.status,
    );
    if (entity.invoices) {
      schedule.invoices = entity.invoices.map(invoice =>
        InvoiceMapper.toDomain(invoice),
      );
    }
    return schedule;
  }
}
