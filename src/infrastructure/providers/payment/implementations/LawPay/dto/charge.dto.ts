import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

import { BankDto } from "./bank.dto";
import { CardDto } from "./card.dto";
import { RefundDto } from "./refund.dto";

export enum ChargeStatus {
  PENDING = "PENDING",
  AUTHORIZED = "AUTHORIZED",
  COMPLETED = "COMPLETED",
  VOIDED = "VOIDED",
  FAILED = "FAILED",
}

enum CVVResult {
  MATCHED = "MATCHED",
  NOT_MATCHED = "NOT_MATCHED",
  ERROR = "ERROR",
  INVALID = "INVALID",
  NOT_PROCESSED = "NOT_PROCESSED",
  NOT_PRESENT_ON_CARD = "NOT_PRESENT_ON_CARD",
  UNAVAILABLE = "UNAVAILABLE",
  NO_RESPONSE = "NO_RESPONSE",
}

enum AVSResult {
  ADDRESS = "ADDRESS",
  ADDRESS_INTL = "ADDRESS_INTL",
  NO_MATCH_INTL = "NO_MATCH_INTL",
  EXACT_MATCH_INTL = "EXACT_MATCH_INTL",
  AVS_ERROR_INELIGIBLE = "AVS_ERROR_INELIGIBLE",
  EXACT_MATCH_UK = "EXACT_MATCH_UK",
  NOT_SUPPORTED_INTL = "NOT_SUPPORTED_INTL",
  UNAVAILABLE_INTL = "UNAVAILABLE_INTL",
  ADDRESS_AND_POSTAL_CODE = "ADDRESS_AND_POSTAL_CODE",
  NO_MATCH = "NO_MATCH",
  POSTAL_CODE = "POSTAL_CODE",
  RETRY = "RETRY",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  UNAVAILABLE = "UNAVAILABLE",
  ZIP9 = "ZIP9",
  ADDRESS_AND_ZIP9 = "ADDRESS_AND_ZIP9",
  ADDRESS_AND_ZIP5 = "ADDRESS_AND_ZIP5",
  ZIP5 = "ZIP5",
}

export class LPChargeDto {
  @ApiProperty({ description: "The ID of the entity (read-only)" })
  @IsString()
  readonly id!: string;

  @ApiProperty({
    description:
      "The URI that uniquely identifies a transaction in the caller's environment.",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly source_id?: string;

  @ApiProperty({ description: "Date/time the entity was created (read-only)" })
  @IsDate()
  readonly created!: Date;

  @ApiProperty({
    description: "Date/time the entity was last modified (read-only)",
  })
  @IsDate()
  readonly modified!: Date;

  @ApiProperty({
    description:
      "Validation or warning messages associated with an operation (read-only)",
  })
  @IsOptional()
  readonly messages?: string[];

  @ApiProperty({ description: "Type of the transaction (read-only)" })
  @IsString()
  readonly type!: string;

  @ApiProperty({
    description: "ID of the account to receive payment (read-only)",
  })
  @IsString()
  readonly account_id!: string;

  @ApiProperty({
    description: "Status of the transaction (read-only)",
    enum: ChargeStatus,
  })
  @IsEnum(ChargeStatus)
  readonly status!: ChargeStatus;

  @ApiProperty({
    description:
      "Completion timestamp if the transaction is COMPLETED (read-only)",
  })
  @IsOptional()
  @IsDate()
  readonly completion_timestamp?: Date;

  @ApiProperty({
    description: "Failure code indicating reason for failure (read-only)",
  })
  @IsOptional()
  @IsString()
  readonly failure_code?: string;

  @ApiProperty({
    description: "The amount to charge in smallest currency unit",
  })
  @IsNumber()
  readonly amount!: number;

  @ApiProperty({ description: "The amount to be surcharged (optional)" })
  @IsOptional()
  @IsNumber()
  readonly surcharge_amount?: number;

  @ApiProperty({
    description: "Currency in ISO 4217 format (optional, defaults to USD)",
  })
  @IsOptional()
  @IsString()
  readonly currency?: string;

  @ApiProperty({ description: "Details of the payment method used" })
  @IsString()
  readonly method!: BankDto | CardDto;

  @ApiProperty({ description: "Additional data included on the transaction" })
  @IsOptional()
  readonly data?: unknown;

  @ApiProperty({ description: "Whether the charge is auto-captured" })
  @IsOptional()
  @IsBoolean()
  readonly auto_capture?: boolean;

  @ApiProperty({
    description: "Total amount refunded from the authorized amount",
  })
  @IsOptional()
  @IsNumber()
  readonly amount_refunded?: number;

  @ApiProperty({
    description: "Authorization code provided by the processor (read-only)",
  })
  @IsOptional()
  @IsString()
  readonly authorization_code?: string;

  @ApiProperty({
    description: "CVV result from authorization (read-only)",
    enum: CVVResult,
  })
  @IsEnum(CVVResult)
  readonly cvv_result!: CVVResult;

  @ApiProperty({
    description: "AVS result from authorization (read-only)",
    enum: AVSResult,
  })
  @IsEnum(AVSResult)
  readonly avs_result!: AVSResult;

  @ApiProperty({
    description:
      "An optional reference provided by the Merchant (max 128 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly reference?: string;

  @ApiProperty({
    description:
      "An optional reference provided by the Merchant when manually capturing the Charge (max 128 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly capture_reference?: string;

  @ApiProperty({
    description:
      "An optional reference provided by the Merchant when voiding the transaction (max 128 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly void_reference?: string;

  @ApiProperty({
    description: "The ID of the RecurringCharge instance (read-only)",
  })
  @IsOptional()
  @IsString()
  readonly recurring_charge_id?: string;

  @ApiProperty({
    description:
      "The ID of the associated occurrence of the recurring payment (read-only)",
  })
  @IsOptional()
  @IsString()
  readonly recurring_charge_occurrence_id?: string;

  @ApiProperty({
    description: "Subsequent refunds applied to the Charge (read-only)",
  })
  @IsOptional()
  readonly refunds?: RefundDto[];
}
