import { Inject } from "@nestjs/common";

import { PaymentModel } from "@src/domain/models/payment.model";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";

export class RefundPaymentUseCase {
  constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async handle(id: string): Promise<PaymentModel> {
    const payment = await this.paymentRepository.refund(id);
    return payment;
  }
}
