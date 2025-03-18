import { PaymentStatus } from "@src/domain/types/payment-status.type";

export enum LawPayStatus {
  AUTHORIZED = PaymentStatus.AUTHORIZED,
  COMPLETED = PaymentStatus.COMPLETED,
  FAILED = PaymentStatus.FAILED,
  IGNORED = PaymentStatus.CANCELED,
  PENDING = PaymentStatus.PENDING,
  VOIDED = PaymentStatus.CANCELED,
}
