import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  ValidateIf,
} from "class-validator";

export class PaymentIntentDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: "Payment amount", type: Number, example: 100 })
  amount!: number;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: "Payment date",
    type: Date,
    example: new Date().toISOString(),
  })
  @IsOptional()
  payment_date: Date = new Date();

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: "Payment split",
    type: Number,
    example: 1,
  })
  payment_split: number = 1;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: "Base payment",
    type: Number,
    example: 0,
  })
  base_payment: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: "Payment discount",
    type: Number,
    example: 0,
  })
  discount: number = 0;

  @IsIn(["percentage", "fixed"])
  @ValidateIf((o: PaymentIntentDto) => o.discount > 0)
  @ApiProperty({
    description: "Discount type",
    type: String,
    example: "percentage",
  })
  discount_type!: "percentage" | "fixed";

  @IsObject()
  @ApiProperty({
    description: "Payment provider",
    type: Object,
    example: {
      id: "PD-01",
      name: "LawPay",
    },
  })
  provider!: {
    id: string;
    name: string;
  };

  @IsObject()
  @ApiProperty({
    description: "Tenant",
    type: Object,
    example: {
      id: "TN-01",
      name: "Test Tenant",
    },
  })
  tenant!: {
    id: string;
    name: string;
  };
  @IsOptional()
  @IsObject()
  @ApiProperty({
    description: "Payment metadata",
    type: Object,
    example: { id: "client_id" },
  })
  metadata: Record<string, unknown> = {};
}
