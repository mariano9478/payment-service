import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

import { LPChargeDto } from "./charge.dto";

export enum RecurringChargeStatus {
  PENDING = "PENDING",
  PAYING = "PAYING",
  PAID = "PAID",
  IGNORED = "IGNORED",
  FAILED = "FAILED",
}

export class RecurringChargeOccurrenceDto {
  @ApiProperty({ description: "The ID of the entity (read-only)" })
  @IsString()
  readonly id!: string;

  @ApiProperty({
    description:
      "The URI that uniquely identifies a transaction in the caller's environment.",
    example: "MyPartner:contact-12345",
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

  @ApiProperty({ description: "ID of the owning recurring charge (read-only)" })
  @IsString()
  readonly recurring_charge_id!: string;

  @ApiProperty({
    description: "The amount to be collected by this occurrence (read-only)",
  })
  @IsNumber()
  readonly amount!: number;

  @ApiProperty({
    description: "The status of the occurrence (read-only)",
    enum: RecurringChargeStatus,
  })
  @IsEnum(RecurringChargeStatus)
  readonly status!: RecurringChargeStatus;

  @ApiProperty({
    description:
      "The date the Gateway will attempt to collect payment for the occurrence (read-only)",
  })
  @IsDate()
  readonly due_date!: Date;

  @ApiProperty({
    description:
      "The number of attempts made to collect payment on this occurrence (read-only)",
  })
  @IsNumber()
  readonly attempts!: number;

  @ApiProperty({
    description:
      "The last time an attempt was made to collect payment for this occurrence (read-only)",
  })
  @IsDate()
  readonly last_attempt!: Date;

  @ApiProperty({
    description:
      "The transactions which have attempted to collect payment for this occurrence (read-only)",
  })
  @IsOptional()
  readonly transactions?: LPChargeDto[];
}
