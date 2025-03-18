import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

enum CardType {
  MASTERCARD = "MASTERCARD",
  VISA = "VISA",
  AMERICAN_EXPRESS = "AMERICAN_EXPRESS",
  DISCOVER = "DISCOVER",
  DINERS_CLUB = "DINERS_CLUB",
  JCB = "JCB",
  UNKNOWN = "UNKNOWN",
}

enum CardStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export class CardDto {
  @ApiProperty({ description: "The ID of the entity (read-only)" })
  @IsString()
  @IsOptional()
  readonly id?: string;

  @ApiProperty({ description: "Date/time the entity was created (read-only)" })
  @IsDate()
  @IsOptional()
  readonly created?: Date;

  @ApiProperty({
    description: "Date/time the entity was last modified (read-only)",
  })
  @IsDate()
  @IsOptional()
  readonly modified?: Date;

  @ApiProperty({ description: "The type of the payment method, always card" })
  @IsString()
  @IsOptional()
  readonly type?: string;

  @ApiProperty({ description: "ID of a one-time payment token (optional)" })
  @IsOptional()
  @IsString()
  readonly token_id?: string;

  @ApiProperty({ description: "The credit card number" })
  @IsString()
  readonly number!: string;

  @ApiProperty({
    description: "A unique fingerprint for the card number (read-only)",
  })
  @IsString()
  @IsOptional()
  readonly fingerprint?: string;

  @ApiProperty({ description: "Type of the credit card", enum: CardType })
  @IsEnum(CardType)
  @IsOptional()
  readonly card_type?: CardType;

  @ApiProperty({ description: "Card expiration month (1-12)" })
  @IsNumber()
  readonly exp_month!: number;

  @ApiProperty({ description: "Card expiration year (2 or 4 digits)" })
  @IsNumber()
  readonly exp_year!: number;

  @ApiProperty({ description: "Card CVV (optional)" })
  @IsOptional()
  @IsString()
  readonly cvv?: string;

  @ApiProperty({ description: "Card magnetic stripe track 1 data (optional)" })
  @IsOptional()
  @IsString()
  readonly track1?: string;

  @ApiProperty({ description: "Card magnetic stripe track 2 data (optional)" })
  @IsOptional()
  @IsString()
  readonly track2?: string;

  @ApiProperty({ description: "Card holder name (optional)" })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({ description: "Card holder address (optional)" })
  @IsOptional()
  @IsString()
  readonly address1?: string;

  @ApiProperty({
    description: "Additional card holder address line (optional)",
  })
  @IsOptional()
  @IsString()
  readonly address2?: string;

  @ApiProperty({ description: "Card holder city (optional)" })
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiProperty({ description: "Card holder state (optional)" })
  @IsOptional()
  @IsString()
  readonly state?: string;

  @ApiProperty({
    description: "Billing zip or postal code (optional, max 10 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  readonly postal_code?: string;

  @ApiProperty({ description: "Card holder country (optional)" })
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
    description: "Reference for the card details (optional, max 64 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly reference?: string;

  @ApiProperty({
    description: "Description for the card details (optional, max 64 chars)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly description?: string;

  @ApiProperty({ description: "Status of the card", enum: CardStatus })
  @IsEnum(CardStatus)
  @IsOptional()
  readonly status?: CardStatus;
}
