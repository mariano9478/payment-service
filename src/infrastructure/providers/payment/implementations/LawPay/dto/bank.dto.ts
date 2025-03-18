import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

enum AccountType {
  CHECKING = "CHECKING",
  SAVINGS = "SAVINGS",
}

enum AccountHolderType {
  INDIVIDUAL = "individual",
  BUSINESS = "business",
}

export class BankDto {
  @ApiProperty({ description: "The ID of the entity (read-only)" })
  @IsString()
  @IsOptional()
  readonly id?: string;

  @ApiProperty({ description: "Date/time the entity was created (read-only)" })
  @IsOptional()
  @IsDate()
  readonly created?: Date;

  @ApiProperty({
    description: "Date/time the entity was last modified (read-only)",
  })
  @IsOptional()
  @IsDate()
  readonly modified?: Date;

  @ApiProperty({ description: "The type of the payment method. Always bank" })
  @IsOptional()
  @IsString()
  readonly type?: string;

  @ApiProperty({ description: "ID of a one-time payment token (optional)" })
  @IsOptional()
  @IsString()
  readonly token_id?: string;

  @ApiProperty({ description: "9-digit routing number of the customer bank" })
  @IsString()
  readonly routing_number!: string;

  @ApiProperty({ description: "Customer bank account number (4-17 digits)" })
  @IsString()
  readonly account_number!: string;

  @ApiProperty({
    description: "Type of the customer bank account",
    enum: AccountType,
  })
  @IsEnum(AccountType)
  readonly account_type!: AccountType;

  @ApiProperty({
    description:
      "Name of the bank associated with the routing number (read-only)",
  })
  @IsString()
  readonly bank_name!: string;

  @ApiProperty({
    description:
      "Unique fingerprint for the bank routing and account number (read-only)",
  })
  @IsOptional()
  @IsString()
  readonly fingerprint?: string;

  @ApiProperty({
    description: "Type of account holder",
    enum: AccountHolderType,
  })
  @IsOptional()
  @IsEnum(AccountHolderType)
  readonly account_holder_type?: AccountHolderType;

  @ApiProperty({
    description: "Business name (required for business account_holder_type)",
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({
    description:
      "First name of the account holder (required for individual account_holder_type)",
  })
  @IsOptional()
  @IsString()
  readonly given_name?: string;

  @ApiProperty({
    description:
      "Last name of the account holder (required for individual account_holder_type)",
  })
  @IsOptional()
  @IsString()
  readonly surname?: string;

  @ApiProperty({ description: "Customer address (optional)" })
  @IsOptional()
  @IsString()
  readonly address1?: string;

  @ApiProperty({ description: "Additional address line (optional)" })
  @IsOptional()
  @IsString()
  readonly address2?: string;

  @ApiProperty({ description: "Customer city (optional)" })
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiProperty({ description: "Customer state (optional)" })
  @IsOptional()
  @IsString()
  readonly state?: string;

  @ApiProperty({ description: "Customer postal code (optional, max 10 chars)" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  readonly postal_code?: string;

  @ApiProperty({ description: "Customer country code (optional)" })
  @IsOptional()
  @IsString()
  readonly country?: string;

  @ApiProperty({ description: "Customer email address (optional)" })
  @IsOptional()
  @IsString()
  readonly email?: string;

  @ApiProperty({
    description: "Customer phone number (optional, max 22 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(22)
  readonly phone?: string;

  @ApiProperty({
    description: "Reference for the bank details (optional, max 64 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly reference?: string;

  @ApiProperty({
    description: "Description for the bank details (optional, max 64 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly description?: string;
}
