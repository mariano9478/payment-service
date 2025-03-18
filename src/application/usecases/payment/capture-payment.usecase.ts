import { Inject } from "@nestjs/common";

import { CaptureDto } from "@src/domain/dtos/in/payment-capture.dto";
import { BaseResponseDto } from "@src/domain/dtos/out/base-response.dto";
import { IPaymentRepository } from "@src/domain/ports/repositories/payment.repository";

export class CapturePaymentUseCase {
  constructor(
    @Inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  public async handle(
    paymentId: string,
    payload: CaptureDto,
  ): Promise<BaseResponseDto> {
    return this.paymentRepository.capturePayment(paymentId, payload);
  }
}
