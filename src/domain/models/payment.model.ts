import { ApiProperty, OmitType } from "@nestjs/swagger";

import { PaymentStatus } from "../types/payment-status.type";
import { ProviderModel } from "./provider.model";
import { ScheduleModel } from "./schedule.model";
import { TenantModel } from "./tenant.model";

export class PaymentModel {
  @ApiProperty({ name: "id", type: "string", example: "PY-001" })
  id: string;
  @ApiProperty({ name: "amount", type: "number", example: 100 })
  amount: number;
  @ApiProperty({ name: "payment_date", type: "string", example: "2021-12-31" })
  payment_date: Date;
  @ApiProperty({ name: "metadata", type: "object", example: { key: "value" } })
  tenant!: TenantModel;
  @ApiProperty({ name: "metadata", type: "object", example: { key: "value" } })
  metadata: Record<string, unknown>;
  @ApiProperty({ name: "payment_split", type: "number", example: 2 })
  payment_split: number;
  @ApiProperty({ name: "base_payment", type: "number", example: 50 })
  base_payment: number;
  @ApiProperty({ name: "discount", type: "number", example: 10 })
  discount!: number;
  @ApiProperty({ name: "discount_type", type: "string", example: "percentage" })
  discount_type!: "percentage" | "fixed";
  @ApiProperty({ name: "status", type: "string", example: "PENDING" })
  status: PaymentStatus;
  @ApiProperty({ name: "provider", type: ProviderModel })
  provider!: ProviderModel;
  @ApiProperty({ name: "schedules", type: [ScheduleModel] })
  schedules!: ScheduleModel[];

  constructor(
    id: string,
    amount: number,
    date: Date,
    metadata: Record<string, unknown>,
    payment_split: number,
    base_payment: number,
    discount: number,
    discount_type: "percentage" | "fixed",
    status: PaymentStatus,
  ) {
    this.id = id;
    this.amount = amount;
    this.payment_date = date;
    this.metadata = metadata;
    this.payment_split = payment_split;
    this.base_payment = base_payment;
    this.discount = discount;
    this.discount_type = discount_type;
    this.status = status;
  }
}
export class PaymentOnlyModel extends OmitType(PaymentModel, [
  "schedules",
  "provider",
]) {}
