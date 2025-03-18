import { BadRequestException, Logger } from "@nestjs/common";
import axios, { Axios, AxiosError, AxiosResponse } from "axios";
// eslint-disable-next-line node/no-extraneous-import
import qs from "qs";

import { PaymentStatus } from "@src/domain/types/payment-status.type";
import { AuthValidation } from "@src/infrastructure/providers/payment/decorator/auth-validation.decorator";
import { BasicResponseDto } from "@src/infrastructure/providers/payment/dto/basic-response.dto";
import { ScheduleDto } from "@src/infrastructure/providers/payment/dto/schedule.dto";
import {
  AlertType,
  EventType,
  WebhookResponseDto,
} from "@src/infrastructure/providers/payment/dto/webhook-response.dto";
import { IPaymentProvider } from "@src/infrastructure/providers/payment/payment.interface";
import { PaymentConfigService } from "@src/shared/config/payment/config.service";
import { KeyVaultConfigService } from "@src/shared/config/secrets/keyvault/config.service";

import { ChargeDto } from "../../dto/charge.dto";
import { ClientDto } from "../../dto/client.dto";
import { BankDto } from "./dto/bank.dto";
import { CardDto } from "./dto/card.dto";
import { LPChargeDto } from "./dto/charge.dto";
import { RefundDto } from "./dto/refund.dto";
import { LawPayStatus } from "./dto/status.enum";
import { LawPayWebhookDto } from "./dto/webhook.dto";

export class LawPayProvider implements IPaymentProvider {
  private readonly logger = new Logger(LawPayProvider.name);
  private paymentConfigService!: PaymentConfigService;
  private keyVaultConfigService!: KeyVaultConfigService;
  authenticated: boolean = false;
  private token: string = "";
  private secret: string = "";
  private bearerInstance: Axios;
  private basicInstance: Axios;
  private tenant: string = "";
  private readonly provider = "LAWPAY";

  constructor(
    tenant: string,
    paymentConfigService: PaymentConfigService,
    keyVaultConfigService: KeyVaultConfigService,
  ) {
    this.paymentConfigService = paymentConfigService;
    this.keyVaultConfigService = keyVaultConfigService;
    this.tenant = tenant;
    const bearerInstance = axios.create();
    bearerInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: {
        response: { status: number };
        config: { headers: { [x: string]: string } };
      }) => {
        if (error.response?.status === 401) {
          this.logger.warn("LawPay Bearer Unauthorized, re-authenticating...");
          await this.authenticate();
          error.config.headers["Authorization"] = `Bearer ${this.token}`;
          return bearerInstance.request(error.config);
        }
        throw error;
      },
    );
    const basicInstance = axios.create();

    basicInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: {
        response: { status: number };
        config: { headers: { [x: string]: string } };
      }) => {
        if (error.response?.status === 401) {
          this.logger.warn("LawPay Basic Unauthorized, re-authenticating...");
        }
        throw error;
      },
    );
    this.bearerInstance = bearerInstance;
    this.basicInstance = basicInstance;
    this.authenticate().catch(error => {
      this.logger.error(error, "Error authenticating");
    });
  }
  private async authenticate(): Promise<void> {
    const url = "https://api.affinipay.com/oauth/token";

    try {
      const is_local = this.paymentConfigService.isLocal;
      const b64_secret_env = this.paymentConfigService.getEnvVariable(
        this.tenant,
        this.provider,
        "secret",
      );
      const b64_secret = is_local
        ? b64_secret_env
        : await this.keyVaultConfigService.getKeyVaultSecret(b64_secret_env);
      const env_client_id = this.paymentConfigService.getClientId(
        this.tenant,
        this.provider,
      );
      const client_id: string = is_local
        ? env_client_id
        : await this.keyVaultConfigService.getKeyVaultSecret(env_client_id);
      const env_client_secret = this.paymentConfigService.getClientSecret(
        this.tenant,
        this.provider,
      );
      const client_secret: string = is_local
        ? env_client_secret
        : await this.keyVaultConfigService.getKeyVaultSecret(env_client_secret);
      const body = qs.stringify({
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
        scope: "payments",
      });
      const response = await axios.post(url, body, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const { access_token } = response.data as { access_token: string };
      this.token = access_token;
      this.secret = b64_secret;
      this.authenticated = true;
      this.logger.log("LawPay Authenticated");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        this.logger.error(axiosError.cause, "LawPay Authentication Error");
      } else {
        this.logger.error(error, "LawPay Authentication Error:");
      }
    }
  }
  @AuthValidation()
  async createCharge(charge: ChargeDto): Promise<BasicResponseDto> {
    const is_local = this.paymentConfigService.isLocal;
    this.logger.log("Getting destination account");
    const account_kv = this.paymentConfigService.getAccount(
      this.tenant,
      this.provider,
      charge.method_type,
    );
    const account = is_local
      ? account_kv
      : await this.keyVaultConfigService.getKeyVaultSecret(account_kv);
    this.logger.log("Creating charge with LawPay API");
    return this.basicInstance
      .post(
        "https://api.affinipay.com/v1/charges",
        {
          amount: String(charge.amount),
          method: charge.method,
          account_id: account,
          reference: Buffer.from(JSON.stringify(charge.reference)).toString(
            "base64",
          ),
        },
        {
          headers: {
            Authorization: `Basic ${this.secret}`,
          },
        },
      )
      .then((response: { data: LPChargeDto }) => {
        this.logger.log("Charge created successfully");
        return {
          transaction_id: response.data.id,
          status: PaymentStatus.AUTHORIZED,
          data: {
            amount: response.data.amount,
          },
        };
      })
      .catch(error => {
        this.logger.error(error, "Error creating charge");
        throw error;
      });
  }

  scheduleCompletedCharge(
    amount: number,
    schedule: ScheduleDto,
    charge_id: string,
  ): Promise<{ transaction_id: string; status: string }> {
    return this.bearerInstance
      .post(
        `https://api.affinipay.com/v1/charges/${charge_id}-Q//schedule`,
        {
          amount,
          schedule: {
            start: schedule.start?.toISOString().split("T")[0],
            end: schedule.end?.toISOString().split("T")[0],
            ...schedule,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .then((response: { data: LPChargeDto }) => {
        return {
          transaction_id: response.data.id,
          status: "SCHEDULED",
        };
      })
      .catch(error => {
        this.logger.error(error, "Error scheduling charge");
        throw error;
      });
  }

  createRecurringCharge(
    amount: number,
    schedule: ScheduleDto,
    method: string,
  ): Promise<BasicResponseDto> {
    return this.bearerInstance
      .post(
        "https://api.affinipay.com/v1/recurring/charges",
        {
          amount,
          method,
          schedule: {
            start: schedule.start?.toISOString().split("T")[0],
            end: schedule.end?.toISOString().split("T")[0],
            ...schedule,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .then((response: { data: LPChargeDto }) => {
        return {
          transaction_id: response.data.id,
          status: "SCHEDULED",
        };
      })
      .catch(error => {
        this.logger.error(error, "Error creating charge");
        throw error;
      });
  }

  cancelRecurringCharge(charge_id: string): Promise<BasicResponseDto> {
    return this.bearerInstance
      .delete(
        `https://api.affinipay.com/v1/recurring/charges/${charge_id}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .then(() => {
        return {
          transaction_id: charge_id,
          status: "CANCELLED",
        };
      })
      .catch(error => {
        this.logger.error(error, "Error cancelling charge");
        throw error;
      });
  }

  async refundCharge(charge_id: string): Promise<BasicResponseDto> {
    return this.bearerInstance
      .post(
        `https://api.affinipay.com/v1/charges/${charge_id}/refund`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .then((response: { data: RefundDto }) => {
        return {
          transaction_id: response.data.id,
          status: "REFUNDED",
          data: {
            amount: response.data.amount,
            currency: response.data.currency,
            charge_id: response.data.charge_id,
          },
        };
      })
      .catch(error => {
        this.logger.error(error, "Error refunding charge");
        throw new Error("Error refunding charge");
      });
  }

  @AuthValidation()
  addClientPaymentMethod(
    client: string,
    method: { token: string; type: "CARD" | "BANK" },
  ): Promise<string> {
    const is_local = this.paymentConfigService.isLocal;
    return this.bearerInstance
      .post(
        `https://api.affinipay.com/contacts/${client}/payment-methods`,
        {
          payment_type: method.type === "CARD" ? "credit_card" : "bank_account",
          one_time_token: method.token,
          authorized_uses: ["all"],
          test_mode: is_local,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .then((response: { data: CardDto | BankDto }) => {
        return response.data.id ?? "";
      })
      .catch(
        (error: {
          response: { data: { messages: { message: string }[] } };
        }) => {
          const message = error.response.data.messages;
          if (message) {
            const errors = message.map(m => m.message);
            this.logger.error(errors, "Error saving payment method");
            throw new BadRequestException(errors.join(", "));
          }
          this.logger.error(
            error.response.data.messages,
            "Error saving payment method",
          );
          throw error;
        },
      );
  }
  @AuthValidation()
  createClient(client: ClientDto): Promise<ClientDto> {
    const is_local = this.paymentConfigService.isLocal;

    const data = {
      first_name: client.first_name,
      last_name: client.last_name,
      email_addresses: [{ address: client.email }],
      tags: ["default"],
      type: "person",
      test_mode: is_local,
    };

    return this.bearerInstance
      .post("https://api.affinipay.com/contacts", data)
      .then((response: { data: { id: string } }) => {
        this.logger.log(response, "Created Client");
        return {
          id: response.data.id,
          ...client,
        };
      })
      .catch(error => {
        throw error;
      });
  }

  processWebhook(event: LawPayWebhookDto): WebhookResponseDto {
    this.logger.log(`Handling LawPay webhook for event ${event.type}`);
    switch (event.type) {
      case "transaction.authorized": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.AUTHORIZED as unknown as PaymentStatus,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
      case "transaction.completed": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.COMPLETED as unknown as PaymentStatus,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
      case "transaction.voided": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.VOIDED as unknown as PaymentStatus,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
      case "transaction.failed": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.FAILED as unknown as PaymentStatus,
          failure_message: event.data.failure_code,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
      case "recurring_charge.payment_method.expiring": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.TRANSACTION_ALERT,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.FAILED as unknown as PaymentStatus,
          payment_id: event.data.reference.payment_id as string,
          alert_type: AlertType.PAYMENT_METHOD_EXPIRING as unknown as AlertType,
        };
        return webhookResponse;
      }
      case "recurring_charge.occurrence.created": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.COMPLETED as unknown as PaymentStatus,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
      case "recurring_charge.occurrence.paid": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.COMPLETED as unknown as PaymentStatus,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
      case "recurring_charge.occurrence.failed": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.FAILED as unknown as PaymentStatus,
          failure_message: event.data.failure_code,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
      case "recurring_charge.occurrence.ignored": {
        const webhookResponse: WebhookResponseDto = {
          id: event.id,
          type: EventType.STATUS_UPDATE,
          created: new Date(event.data.created),
          object_id: event.data.id,
          status: LawPayStatus.VOIDED as unknown as PaymentStatus,
          payment_id: event.data.reference.payment_id as string,
        };
        return webhookResponse;
      }
    }
    this.logger.log(`Unhandle event type ${event.type} in LawPayProvider`);
    throw new Error(`Unhandle event type ${event.type} in LawPayProvider`);
  }
}
