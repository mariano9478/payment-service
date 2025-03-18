import { ApiProperty } from "@nestjs/swagger";

import { PaymentStatus } from "../types/payment-status.type";

export class InvoiceModel {
  @ApiProperty({ name: "id", type: "string", example: "IV-001" })
  id: string;
  @ApiProperty({ name: "transaction_id", type: "string", example: "TR-001" })
  transaction_id: string;
  @ApiProperty({ name: "amount", type: "number", example: 100 })
  amount: number;
  @ApiProperty({ name: "status", type: "string", example: "PENDING" })
  status: PaymentStatus;

  constructor(
    id: string,
    transaction_id: string,
    amount: number,
    status: PaymentStatus,
  ) {
    this.id = id;
    this.transaction_id = transaction_id;
    this.amount = amount;
    this.status = status;
  }
}
