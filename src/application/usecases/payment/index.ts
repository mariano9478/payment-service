import { CreatePaymentUseCase } from "../payment/create-payment.usecase";
import { GetPaymentByIdUseCase } from "../payment/get-payment-by-id.usecase";
import { CapturePaymentUseCase } from "./capture-payment.usecase";
import { ChargePaymentIntentUseCase } from "./charge-payment-intent.usecase";
import { GetPendingPaymentsUseCase } from "./get-pending-payments.usecase";
import { RefundPaymentUseCase } from "./refund-payment.usecase";
import { UpdatePaymentStatusUseCase } from "./update-payment-status.usecase";
const PAYMENT_USECASE = [
  CreatePaymentUseCase,
  GetPaymentByIdUseCase,
  UpdatePaymentStatusUseCase,
  RefundPaymentUseCase,
  CapturePaymentUseCase,
  GetPendingPaymentsUseCase,
  ChargePaymentIntentUseCase,
];
export default PAYMENT_USECASE;
