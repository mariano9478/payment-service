import { Inject } from "@nestjs/common";

import { PaymentModel } from "@src/domain/models/payment.model";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";

export class GetPendingPaymentsUseCase {
  constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  public async handle(): Promise<PaymentModel[]> {
    return await this.paymentRepository.getPendingPayments();
  }
}
