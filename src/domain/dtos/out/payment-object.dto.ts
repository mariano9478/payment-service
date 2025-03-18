import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";

import { PaymentStatus } from "@src/domain/types/payment-status.type";

export class PaymentObjectDto {
  @IsString()
  @ApiProperty({ description: "Payment id", type: String, example: "PY001" })
  id!: string;

  @IsDate()
  @ApiProperty({
    description: "Payment date",
    type: Date,
    example: "2021-09-01T00:00:00.000Z",
  })
  date!: Date;

  @IsNumber()
  @ApiProperty({ description: "Payment amount", type: Number, example: 100 })
  amount!: number;

  @IsNumber()
  @ApiProperty({
    description: "Payment split",
    type: Number,
    example: 1,
  })
  payment_split: number = 1;

  @IsNumber()
  @ApiProperty({
    description: "Base payment",
    type: Number,
    example: 0,
  })
  base_payment: number = 0;

  @IsString()
  @ApiProperty({
    description: "Payment provider",
    type: String,
    example: "LawPay",
  })
  provider!: string;

  @IsString()
  @ApiProperty({
    description: "Payment status",
    type: String,
    example: "PENDING",
  })
  status!: PaymentStatus;

  @IsNumber()
  @ApiProperty({
    description: "Payment discount",
    type: Number,
    example: 0,
  })
  discount: number = 0;
}
