import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsObject, IsString, ValidateIf } from "class-validator";

import { PaymentStatus } from "@src/domain/types/payment-status.type";

export enum EventType {
  STATUS_UPDATE = "STATUS_UPDATE",
  REFUND_UPDATE = "REFUND_UPDATE",
  TRANSACTION_ALERT = "TRANSACTION_ALERT",
}

export enum AlertType {
  PAYMENT_METHOD_EXPIRING = "PAYMENT_METHOD_EXPIRING",
  INVOICE_CREATED = "INVOICE_CREATED",
}
export class WebhookResponseDto {
  @ApiProperty({ description: "The type of the event", enum: EventType })
  @IsString()
  type!: EventType;

  @ApiProperty({ description: "The ID of the event" })
  @IsString()
  id!: string;
  @ApiProperty({ description: "The date when the event was created" })
  @IsDate()
  created!: Date;
  @ApiProperty({ description: "The id of the object related to the event" })
  @IsString()
  object_id!: string;
  @ApiProperty({ description: "The id of the payment" })
  @IsString()
  payment_id!: string;
  @ApiProperty({ description: "The status of the event", enum: PaymentStatus })
  @IsString()
  status!: PaymentStatus;

  @ApiProperty({ description: "Failure message" })
  @ValidateIf((o: WebhookResponseDto) => o.status === PaymentStatus.FAILED)
  @IsString()
  failure_message?: string;

  @ApiProperty({ description: "Type of the alert event", enum: AlertType })
  @ValidateIf((o: WebhookResponseDto) => o.type === EventType.TRANSACTION_ALERT)
  @IsString()
  alert_type?: AlertType;

  @ApiProperty({ description: "Data related to the alert event" })
  @ValidateIf((o: WebhookResponseDto) => o.type === EventType.TRANSACTION_ALERT)
  @IsObject()
  alert_data?: Record<string, unknown>;
}
