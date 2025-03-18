import { CaptureDto } from "@src/domain/dtos/in/payment-capture.dto";
import { BaseResponseDto } from "@src/domain/dtos/out/base-response.dto";
import { PaymentModel } from "@src/domain/models/payment.model";
import { PaymentStatus } from "@src/domain/types/payment-status.type";

export interface IPaymentRepository {
  createPayment(config: PaymentModel): Promise<PaymentModel>;
  getPaymentById(id: string, relations?: string[]): Promise<PaymentModel>;
  updateStatus(id: string, status: PaymentStatus): Promise<PaymentModel>;
  refund(id: string): Promise<PaymentModel>;
  capturePayment(
    paymentId: string,
    payload: CaptureDto,
  ): Promise<BaseResponseDto>;
  getPendingPayments(): Promise<PaymentModel[]>;
  createCharge(paymentId: string): Promise<BaseResponseDto>;
  /*   cancelPayment(): void;
  refundPayment(): void;
  getPaymentStatus(): void;
  getPaymentDetails(): void; */
}
