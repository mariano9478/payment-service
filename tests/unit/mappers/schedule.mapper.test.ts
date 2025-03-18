import { PaymentStatus } from "@src/domain/types/payment-status.type";

import { ScheduleModel } from "../../../src/domain/models/schedule.model";
import { ScheduleEntity } from "../../../src/infrastructure/adapters/entities/schedule.entity";
import { ScheduleMapper } from "../../../src/infrastructure/mappers/schedule.mapper";

describe("ScheduleMapper", () => {
  it("should map ScheduleEntity to ScheduleModel correctly", () => {
    const entity: ScheduleEntity = {
      id: "1",
      schedule_date: new Date(),
      amount: 100,
      status: PaymentStatus.COMPLETED,
    } as unknown as ScheduleEntity;
    const expectedModel: ScheduleModel = new ScheduleModel(
      "1",
      entity.schedule_date,
      100,
      PaymentStatus.COMPLETED,
    );
    const result = ScheduleMapper.toDomain(entity);
    expect(result).toEqual(expectedModel);
  });
});
