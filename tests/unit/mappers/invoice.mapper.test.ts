import { PaymentStatus } from "@src/domain/types/payment-status.type";

import { InvoiceModel } from "../../../src/domain/models/invoice.model";
import { InvoiceEntity } from "../../../src/infrastructure/adapters/entities/invoice.entity";
import { InvoiceMapper } from "../../../src/infrastructure/mappers/invoice.mapper";

describe("InvoiceMapper", () => {
  it("should map InvoiceEntity to InvoiceModel correctly", () => {
    const entity: InvoiceEntity = {
      id: "1",
      transaction_id: "txn_1",
      amount: 100,
      status: PaymentStatus.COMPLETED,
    } as InvoiceEntity;
    const expectedModel: InvoiceModel = new InvoiceModel(
      "1",
      "txn_1",
      100,
      PaymentStatus.COMPLETED,
    );
    const result = InvoiceMapper.toDomain(entity);
    expect(result).toEqual(expectedModel);
  });
});
