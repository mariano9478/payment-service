import { Inject } from "@nestjs/common";

import { BaseResponseDto } from "@src/domain/dtos/out/base-response.dto";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";

export class ChargePaymentIntentUseCase {
  constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  public async handle(paymentId: string): Promise<BaseResponseDto> {
    return this.paymentRepository.createCharge(paymentId);
  }
}
