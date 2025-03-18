import { Inject } from "@nestjs/common";

import { PaymentModel } from "@src/domain/models/payment.model";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";

export class GetPaymentByIdUseCase {
  constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  public async handle(paymentId: string): Promise<PaymentModel> {
    return this.paymentRepository.getPaymentById(paymentId);
  }
}
