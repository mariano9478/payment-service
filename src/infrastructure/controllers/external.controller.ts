import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { CapturePaymentUseCase } from "@src/application/usecases/payment/capture-payment.usecase";
import { CreatePaymentUseCase } from "@src/application/usecases/payment/create-payment.usecase";
import { GetPaymentByIdUseCase } from "@src/application/usecases/payment/get-payment-by-id.usecase";
import { GetPendingPaymentsUseCase } from "@src/application/usecases/payment/get-pending-payments.usecase";
import { RefundPaymentUseCase } from "@src/application/usecases/payment/refund-payment.usecase";
import { CaptureDto } from "@src/domain/dtos/in/payment-capture.dto";
import { PaymentIntentDto } from "@src/domain/dtos/in/payment-intent.dto";
import { BaseResponseDto } from "@src/domain/dtos/out/base-response.dto";
import {
  PaymentModel,
  PaymentOnlyModel,
} from "@src/domain/models/payment.model";
import { CacheResponseInterceptor } from "@src/interceptors/cahce-response.interceptor";

import { ApiGlobalErrorResponse } from "../../interceptors/response.interceptor";
import { ChargePaymentIntentUseCase } from "./../../application/usecases/payment/charge-payment-intent.usecase";

@ApiTags("External")
@ApiExtraModels()
@ApiGlobalErrorResponse()
@Controller("external")
export class ExternalController {
  private readonly logger = new Logger(ExternalController.name);
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    private readonly refundPaymentUseCase: RefundPaymentUseCase,
    private readonly capturePaymentUseCase: CapturePaymentUseCase,
    private readonly getPendingPaymentsUseCase: GetPendingPaymentsUseCase,
    private readonly chargePaymentIntentUseCase: ChargePaymentIntentUseCase,
  ) {}

  @Post("payment")
  @UseInterceptors(CacheResponseInterceptor)
  @ApiOperation({
    summary: "Create a payment intent",
    description: "Create a payment intent",
  })
  @ApiBody({
    type: PaymentIntentDto,
  })
  @ApiResponse({
    status: 201,
    description: "Payment intent created",
    type: PaymentModel,
  })
  async createPayment(
    @Body() payload: PaymentIntentDto,
  ): Promise<PaymentModel> {
    this.logger.log("Creating payment intent");
    const result = this.createPaymentUseCase.handle(payload);
    this.logger.log("Payment intent created");
    return result;
  }

  @Get("payment/:id")
  @ApiOperation({
    summary: "Get a payment intent",
    description: "Get a payment intent",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "Payment intent id",
  })
  @ApiResponse({
    status: 200,
    description: "Payment intent retrieved",
    type: PaymentOnlyModel,
  })
  async getPaymentById(@Param("id") id: string): Promise<PaymentModel> {
    this.logger.log("Getting payment intent");
    const result = this.getPaymentByIdUseCase.handle(id);
    this.logger.log("Payment intent retrieved");
    return result;
  }

  @Post("payment/:id/refund")
  @UseInterceptors(CacheResponseInterceptor)
  @ApiOperation({
    summary: "Refund Payment",
    description: "Refund Payment",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "Payment id",
  })
  @ApiResponse({
    status: 200,
    description: "Payment intent retrieved",
    type: PaymentModel,
  })
  async refundPayment(@Param("id") paymentId: string): Promise<PaymentModel> {
    this.logger.log("Refunding payment");
    const response = await this.refundPaymentUseCase.handle(paymentId);
    this.logger.log("Payment refunded");
    return response;
  }

  @Post("payment/:id/capture")
  @UseInterceptors(CacheResponseInterceptor)
  @ApiOperation({
    summary: "Capture Payment",
    description: "Capture Payment",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "Payment id",
  })
  @ApiResponse({
    status: 200,
    description: "Payment intent retrieved",
    type: BaseResponseDto,
  })
  @ApiBody({
    type: CaptureDto,
  })
  async capturePayment(
    @Param("id") paymentId: string,
    @Body() payload: CaptureDto,
  ): Promise<BaseResponseDto> {
    this.logger.log("Capturing payment");
    const response = await this.capturePaymentUseCase.handle(
      paymentId,
      payload,
    );
    this.logger.log("Payment captured");
    return response;
  }

  @Get("schedule/pending")
  @ApiOperation({
    summary: "Get pending schedules",
    description: "Get pending schedules",
  })
  @ApiResponse({
    status: 200,
    description: "Pending schedules retrieved",
    type: [PaymentModel],
  })
  async getPendingSchedules(): Promise<PaymentModel[]> {
    this.logger.log("Getting pending schedules");
    const result = this.getPendingPaymentsUseCase.handle();
    this.logger.log("Pending schedules retrieved");
    return result;
  }

  @Post("payment/:id/charge")
  @UseInterceptors(CacheResponseInterceptor)
  @ApiOperation({
    summary: "Create payment charge",
    description: "Evaluate if there are pending schedules and create charge",
  })
  @ApiParam({
    name: "id",
    required: true,
    description: "Payment id",
  })
  @ApiResponse({
    status: 200,
    description: "Charges creted",
    type: BaseResponseDto,
  })
  async createCharge(@Param("id") paymentId: string): Promise<BaseResponseDto> {
    this.logger.log("Capturing payment");
    const response = await this.chargePaymentIntentUseCase.handle(paymentId);
    this.logger.log("Payment captured");
    return response;
  }
}
