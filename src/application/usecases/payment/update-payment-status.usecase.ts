import { Inject } from "@nestjs/common";

import { PaymentModel } from "@src/domain/models/payment.model";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";
import { PaymentStatus } from "@src/domain/types/payment-status.type";

export class UpdatePaymentStatusUseCase {
  constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  public async handle(
    paymentId: string,
    status: PaymentStatus,
  ): Promise<PaymentModel> {
    const payment = await this.paymentRepository.updateStatus(
      paymentId,
      status,
    );
    return payment;
  }
}
