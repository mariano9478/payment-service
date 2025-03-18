import { ApiProperty } from "@nestjs/swagger";

import { PaymentStatus } from "../types/payment-status.type";
import { InvoiceModel } from "./invoice.model";

export class ScheduleModel {
  @ApiProperty({ name: "id", type: "string", example: "SC-001" })
  id: string;
  @ApiProperty({ name: "schedule_date", type: "string", example: "2021-12-31" })
  schedule_date: Date;
  @ApiProperty({ name: "amount", type: "number", example: 100 })
  amount: number;
  @ApiProperty({ name: "status", type: "string", example: "PENDING" })
  status: PaymentStatus;
  @ApiProperty({ name: "invoices", type: [InvoiceModel] })
  invoices!: InvoiceModel[];

  constructor(id: string, date: Date, amount: number, status: PaymentStatus) {
    this.id = id;
    this.schedule_date = date;
    this.amount = amount;
    this.status = status;
  }
}
