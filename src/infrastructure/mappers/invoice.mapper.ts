import { InvoiceModel } from "@src/domain/models/invoice.model";

import { InvoiceEntity } from "../adapters/entities/invoice.entity";

export class InvoiceMapper {
  public static toDomain(entity: InvoiceEntity): InvoiceModel {
    const invoice = new InvoiceModel(
      entity.id,
      entity.transaction_id,
      entity.amount,
      entity.status,
    );
    return invoice;
  }
}
