import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

import { BankDto } from "./bank.dto";
import { CardDto } from "./card.dto";

enum RefundStatus {
  PENDING = "PENDING",
  AUTHORIZED = "AUTHORIZED",
  COMPLETED = "COMPLETED",
  VOIDED = "VOIDED",
  FAILED = "FAILED",
}

export class RefundDto {
  @ApiProperty({ description: "The ID of the entity", readOnly: true })
  @IsString()
  readonly id!: string;

  @ApiProperty({
    description: "Unique identifier for the transaction",
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  source_id?: string;

  @ApiProperty({
    description: "Date/time the entity was created",
    readOnly: true,
  })
  @IsISO8601()
  readonly created!: string;

  @ApiProperty({
    description: "Date/time the entity was last modified",
    readOnly: true,
  })
  @IsISO8601()
  readonly modified!: string;

  @ApiProperty({
    description: "Validation or warning messages",
    readOnly: true,
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  messages?: string[];

  @ApiProperty({
    description: "Type of the transaction",
    readOnly: true,
    enum: ["REFUND"],
  })
  @IsString()
  readonly type: string = "REFUND";

  @ApiProperty({
    description: "ID of the account for the refund",
    readOnly: true,
  })
  @IsString()
  readonly account_id!: string;

  @ApiProperty({
    description: "Status of the refund",
    readOnly: true,
    enum: RefundStatus,
  })
  @IsEnum(RefundStatus)
  readonly status!: RefundStatus;

  @ApiProperty({
    description: "Completion timestamp",
    readOnly: true,
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  completion_timestamp?: string;

  @ApiProperty({
    description: "Failure code for failed transactions",
    required: false,
  })
  @IsOptional()
  @IsString()
  failure_code?: string;

  @ApiProperty({ description: "Amount to refund in smallest currency unit" })
  @IsNumber()
  amount!: number;

  @ApiProperty({
    description: "Currency code",
    required: false,
    default: "USD",
  })
  @IsOptional()
  @IsString()
  currency?: string = "USD";

  @ApiProperty({
    description: "Charge ID to which the refund was applied",
    readOnly: true,
  })
  @IsString()
  readonly charge_id!: string;

  @ApiProperty({
    description: "Indicates if the refund is auto-captured",
    readOnly: true,
    default: true,
  })
  @IsBoolean()
  readonly auto_capture: boolean = true;

  @ApiProperty({
    description: "Payment method details for refund",
    required: false,
  })
  @IsOptional()
  method?: BankDto | CardDto;

  @ApiProperty({
    description: "Optional comment for refund creation",
    maxLength: 128,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  reference?: string;

  @ApiProperty({
    description: "Additional data for the transaction",
    required: false,
    type: "object",
  })
  @IsOptional()
  @IsJSON()
  data?: Record<string, unknown>;
}
