import axios from "axios";
import { Repository } from "typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentStatus } from "@src/domain/types/payment-status.type";
import { EventEntity } from "@src/infrastructure/adapters/entities/event.entity";
import { EventTypeEntity } from "@src/infrastructure/adapters/entities/event-type.entity";
import { InvoiceEntity } from "@src/infrastructure/adapters/entities/invoice.entity";
import { PaymentEntity } from "@src/infrastructure/adapters/entities/payment.entity";
import { ProviderEntity } from "@src/infrastructure/adapters/entities/provider.entity";
import { TenantEntity } from "@src/infrastructure/adapters/entities/tenant.entity";
import { InternalRepository } from "@src/infrastructure/adapters/repository/internal.repository";
import {
  EventType,
  WebhookResponseDto,
} from "@src/infrastructure/providers/payment/dto/webhook-response.dto";
import { LawPayWebhookDto } from "@src/infrastructure/providers/payment/implementations/LawPay/dto/webhook.dto";
import { LawPayProvider } from "@src/infrastructure/providers/payment/implementations/LawPay/lawpay.provider";

vi.mock("axios");
vi.mock("uuid", () => ({
  v4: vi.fn(() => "uuid-v4-mock"),
}));

describe("InternalRepository", () => {
  let internalRepository: InternalRepository;
  let lawPayProvider: LawPayProvider;
  let paymentRepository: Repository<PaymentEntity>;
  let invoiceRepository: Repository<InvoiceEntity>;
  let eventTypeRepository: Repository<EventTypeEntity>;

  beforeEach(() => {
    eventTypeRepository = {
      findOne: vi.fn(),
    } as unknown as Repository<EventTypeEntity>;
    invoiceRepository = {
      create: vi.fn(),
      save: vi.fn(),
    } as unknown as Repository<InvoiceEntity>;
    paymentRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
    } as unknown as Repository<PaymentEntity>;
    lawPayProvider = {
      processWebhook: vi.fn(),
    } as unknown as LawPayProvider;
    internalRepository = new InternalRepository(
      lawPayProvider,
      paymentRepository,
      invoiceRepository,
      eventTypeRepository,
    );
  });

  it("should be defined", () => {
    expect(internalRepository).toBeDefined();
  });

  describe("processWebhook", () => {
    it("should process LawPay webhook and update payment status", async () => {
      const event: LawPayWebhookDto = {
        id: "event-id",
        created: new Date(),
        type: "transaction.authorized",
        data: {
          status: PaymentStatus.AUTHORIZED,
          created: new Date(),
          id: "data-id",
          reference: {
            payment_id: "payment-id",
          },
        },
      };
      const payment: PaymentEntity = {
        id: "PY-001",
        amount: 100,
        payment_date: "2021-12-31",
        metadata: {
          key: "value",
        },
        payment_split: 2,
        base_payment: 50,
        discount: 10,
        discount_type: "percentage",
        status: PaymentStatus.PENDING,
        provider: {
          id: "P-001",
          name: "PROVIDER_NAME",
        },
        tenant: {
          id: "tenant",
          name: "tenant",
        },
        schedules: [
          {
            id: "SC-001",
            schedule_date: new Date(),
            amount: 100,
            status: PaymentStatus.PENDING,
            invoices: [],
          },
        ],
      } as unknown as PaymentEntity;
      const webhookResponse: WebhookResponseDto = {
        type: EventType.STATUS_UPDATE,
        payment_id: "PY-001",
        object_id: "event-id",
        created: new Date(),
        id: "uuid-v4-mock",
        status: PaymentStatus.AUTHORIZED,
      };
      const event_type: EventTypeEntity = {
        id: "uuid-v4-mock",
        name: "STATUS_UPDATE",
        events: [
          {
            id: "uuid-v4-mock",
            domain: "domain",
            path: "path",
            tenant: {
              id: "uuid-v4-mock",
              name: "tenant",
            } as unknown as TenantEntity,
          },
        ] as unknown as EventEntity[],
        providers: [{ id: "uuid-v4-mock" }] as unknown as ProviderEntity[],
      } as unknown as EventTypeEntity;

      vi.spyOn(lawPayProvider, "processWebhook").mockReturnValue(
        webhookResponse,
      );
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(payment);
      vi.spyOn(invoiceRepository, "create").mockReturnValue({
        id: "uuid-v4-mock",
        transaction_id: "event-id",
        status: PaymentStatus.AUTHORIZED,
        amount: 100,
        schedule: payment.schedules[0],
      } as unknown as InvoiceEntity);
      vi.spyOn(invoiceRepository, "save").mockResolvedValue({
        id: "uuid-v4-mock",
      } as unknown as InvoiceEntity);
      vi.spyOn(eventTypeRepository, "findOne").mockResolvedValue(event_type);
      vi.spyOn(axios, "post").mockResolvedValue({ status: 200 });

      await internalRepository.processWebhook(event, "LAWPAY");

      expect(lawPayProvider.processWebhook).toHaveBeenCalledWith(event);
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "PY-001" },
        relations: ["schedules", "schedules.invoices", "tenant", "provider"],
      });
      expect(invoiceRepository.create).toHaveBeenCalledWith({
        id: "uuid-v4-mock",
        transaction_id: "event-id",
        status: PaymentStatus.AUTHORIZED,
        amount: 100,
        schedule: payment.schedules[0],
      });
      expect(eventTypeRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: EventType.STATUS_UPDATE,
          providers: [{ id: "P-001" }],
          events: [{ tenant: { id: "tenant" } }],
        },
        relations: ["events", "providers", "events.tenant"],
      });
    });
  });
});
