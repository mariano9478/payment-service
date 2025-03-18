import { Body, Controller, Logger, Param, Patch, Post } from "@nestjs/common";
import { ApiBody, ApiOperation } from "@nestjs/swagger";

import { PaymentModel } from "@src/domain/models/payment.model";
import { PaymentStatus } from "@src/domain/types/payment-status.type";
import { InternalRepository } from "@src/infrastructure/adapters/repository/internal.repository";
import { ApiGlobalErrorResponse } from "@src/interceptors/response.interceptor";

import { UpdatePaymentStatusUseCase } from "./../../application/usecases/payment/update-payment-status.usecase";

@Controller("internal")
@ApiGlobalErrorResponse()
export class InternalController {
  private readonly logger = new Logger(InternalController.name);
  constructor(
    private readonly repository: InternalRepository,
    private readonly updatePaymentStatusUseCase: UpdatePaymentStatusUseCase,
  ) {}

  @Post("webhook/lawpay")
  @ApiOperation({
    summary: "LawPay Webhook",
    description: "LawPay Webhook",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        payload: {
          type: "object",
        },
      },
    },
  })
  async lawPayWebhook(@Body() payload: unknown) {
    this.logger.log("LawPay Webhook Received");
    await this.repository.processWebhook(payload, "LAWPAY");
    this.logger.log("LawPay Webhook Processed");
    return "LawPay Webhook Received";
  }

  @Patch("payment/:id/status")
  @ApiOperation({
    summary: "Update Payment Status",
    description: "Update Payment Status",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: Object.values(PaymentStatus),
        },
      },
      example: {
        status: PaymentStatus.COMPLETED,
      },
    },
  })
  async updatePaymentStatus(
    @Param("id") id: string,
    @Body("status") status: PaymentStatus,
  ): Promise<PaymentModel> {
    this.logger.log("Updating payment status");
    const response = await this.updatePaymentStatusUseCase.handle(id, status);
    this.logger.log("Payment status updated");
    return response;
  }
}
