import { InvoiceModel } from "@src/domain/models/invoice.model";
import { ProviderModel } from "@src/domain/models/provider.model";
import { ScheduleModel } from "@src/domain/models/schedule.model";
import { TenantModel } from "@src/domain/models/tenant.model";
import { PaymentStatus } from "@src/domain/types/payment-status.type";
import { InvoiceEntity } from "@src/infrastructure/adapters/entities/invoice.entity";
import { ProviderEntity } from "@src/infrastructure/adapters/entities/provider.entity";
import { ScheduleEntity } from "@src/infrastructure/adapters/entities/schedule.entity";
import { TenantEntity } from "@src/infrastructure/adapters/entities/tenant.entity";

import { PaymentModel } from "../../../src/domain/models/payment.model";
import { PaymentEntity } from "../../../src/infrastructure/adapters/entities/payment.entity";
import { PaymentMapper } from "../../../src/infrastructure/mappers/payment.mapper";

describe("PaymentMapper", () => {
  it("should map PaymentEntity to PaymentModel correctly", () => {
    const entity: PaymentEntity = {
      id: "1",
      amount: 100,
      payment_date: new Date(),
      metadata: {},
      payment_split: 50,
      base_payment: 50,
      discount: 10,
      discount_type: "percentage",
      status: PaymentStatus.COMPLETED,
      tenant: { id: "1", name: "Tenant Name" } as TenantEntity,
      schedules: [
        {
          id: "1",
          schedule_date: new Date(),
          amount: 100,
          status: PaymentStatus.PENDING,
          invoices: [
            {
              id: "1",
              transaction_id: "txn_1",
              amount: 100,
              status: PaymentStatus.COMPLETED,
            } as InvoiceEntity,
          ],
        },
      ] as unknown as ScheduleEntity[],
      provider: { id: "1", name: "Provider Name" } as ProviderEntity,
    } as PaymentEntity;
    const expectedModel: PaymentModel = new PaymentModel(
      "1",
      100,
      entity.payment_date,
      {},
      50,
      50,
      10,
      "percentage",
      PaymentStatus.COMPLETED,
    );
    const schedule = new ScheduleModel(
      "1",
      entity.schedules[0].schedule_date,
      100,
      PaymentStatus.PENDING,
    );
    schedule.invoices = [
      new InvoiceModel("1", "txn_1", 100, PaymentStatus.COMPLETED),
    ];
    expectedModel.schedules = [schedule];
    expectedModel.tenant = new TenantModel("1", "Tenant Name");
    expectedModel.provider = new ProviderModel("1", "Provider Name");
    const result = PaymentMapper.toDomain(entity);
    expect(result).toEqual(expectedModel);
  });
});
