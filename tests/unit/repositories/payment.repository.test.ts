/* eslint-disable unicorn/no-null */
import { Repository } from "typeorm";

import { PaymentModel } from "@src/domain/models/payment.model";
import { PaymentStatus } from "@src/domain/types/payment-status.type";
import { InvoiceEntity } from "@src/infrastructure/adapters/entities/invoice.entity";
import { MethodEntity } from "@src/infrastructure/adapters/entities/method.entity";
import { ScheduleEntity } from "@src/infrastructure/adapters/entities/schedule.entity";
import { IPaymentProvider } from "@src/infrastructure/providers/payment/payment.interface";
import { PaymentOrchestrator } from "@src/infrastructure/providers/payment/payment-orchestrator";

import { PaymentEntity } from "../../../src/infrastructure/adapters/entities/payment.entity";
import { PaymentRepository } from "../../../src/infrastructure/adapters/repository/payment.repository";

describe("PaymentRepository", () => {
  let repository: PaymentRepository;
  let paymentRepository: Repository<PaymentEntity>;
  let invoiceRepository: Repository<InvoiceEntity>;
  let methodRepository: Repository<MethodEntity>;
  let scheduleRepository: Repository<ScheduleEntity>;
  let provider: PaymentOrchestrator;

  beforeEach(() => {
    paymentRepository = {
      create: vi.fn(() => {}),
      save: vi.fn(() => {}),
      findOne: vi.fn(() => {}),
      merge: vi.fn(() => {}),
      softDelete: vi.fn(() => {}),
    } as unknown as Repository<PaymentEntity>;
    invoiceRepository = {
      create: vi.fn(() => {}),
      save: vi.fn(() => {}),
    } as unknown as Repository<InvoiceEntity>;
    methodRepository = {
      create: vi.fn(() => {}),
      save: vi.fn(() => {}),
    } as unknown as Repository<MethodEntity>;
    scheduleRepository = {
      create: vi.fn(() => {}),
      save: vi.fn(() => {}),
    } as unknown as Repository<ScheduleEntity>;
    provider = {
      getProvider: vi.fn(() => {}),
    } as unknown as PaymentOrchestrator;

    repository = new PaymentRepository(
      paymentRepository,
      invoiceRepository,
      methodRepository,
      scheduleRepository,
      provider,
    );
  });

  describe("createPayment", () => {
    it("should create a payment", async () => {
      const payment = {
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
        schedules: [
          {
            id: "SC-001",
            schedule_date: "2021-12-31",
            amount: 100,
            status: PaymentStatus.PENDING,
          },
        ],
      };
      vi.spyOn(paymentRepository, "create").mockReturnValue(
        payment as unknown as PaymentEntity,
      );
      vi.spyOn(paymentRepository, "save").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );

      await repository.createPayment(payment as unknown as PaymentModel);

      expect(paymentRepository.create).toHaveBeenCalledWith(payment);
      expect(paymentRepository.save).toHaveBeenCalledWith(payment);
    });
  });
  describe("getPaymentById", () => {
    it("should get a payment by id", async () => {
      const payment = {
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
        schedules: [
          {
            id: "SC-001",
            schedule_date: "2021-12-31",
            amount: 100,
            status: PaymentStatus.PENDING,
          },
        ],
      };
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );

      const response = await repository.getPaymentById("PY-001");

      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "PY-001" },
        relations: undefined,
      });
      expect(response).toEqual(payment);
    });
    it("should throw an error if payment is not found", async () => {
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(null);

      await expect(repository.getPaymentById("PY-001")).rejects.toThrowError(
        "Payment not found",
      );
    });
  });
  describe("updateStatus", () => {
    it("should update the status of a payment", async () => {
      const payment = {
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
        schedules: [
          {
            id: "SC-001",
            schedule_date: "2021-12-31",
            amount: 100,
            status: PaymentStatus.PENDING,
          },
        ],
      };
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );
      vi.spyOn(paymentRepository, "save").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );

      const response = await repository.updateStatus(
        "PY-001",
        PaymentStatus.COMPLETED,
      );

      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "PY-001" },
      });
      expect(paymentRepository.save).toHaveBeenCalledWith(payment);
      expect(response).toEqual(payment);
    });
    it("should throw an error if payment is not found", async () => {
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(null);

      await expect(
        repository.updateStatus("PY-001", PaymentStatus.COMPLETED),
      ).rejects.toThrowError("Payment not found");
    });
  });
  describe("refund", () => {
    it("should refund a payment", async () => {
      const payment = {
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
        schedules: [
          {
            id: "SC-001",
            schedule_date: "2021-12-31",
            amount: 100,
            status: PaymentStatus.PENDING,
            invoices: [
              {
                id: "IN-001",
                amount: 100,
                status: PaymentStatus.COMPLETED,
              },
            ],
          },
        ],
      };
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );
      vi.spyOn(provider, "getProvider").mockReturnValue({
        refundCharge: vi.fn(() => {}),
      } as unknown as IPaymentProvider);

      const response = await repository.refund("PY-001");

      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "PY-001" },
        relations: ["schedules"],
      });
      expect(provider.getProvider).toHaveBeenCalledWith(
        "LAWPAY",
        "TEST_TENANT",
      );
      expect(response).toEqual(payment);
    });
    it("should return the payment if it is already refunded", async () => {
      const payment = {
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
        status: PaymentStatus.REFUNDED,
        provider: {
          id: "P-001",
          name: "PROVIDER_NAME",
        },
        schedules: [
          {
            id: "SC-001",
            schedule_date: "2021-12-31",
            amount: 100,
            status: PaymentStatus.PENDING,
            invoices: [
              {
                id: "IN-001",
                amount: 100,
                status: PaymentStatus.COMPLETED,
              },
            ],
          },
        ],
      };
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );

      const response = await repository.refund("PY-001");
      expect(response).toEqual(payment);
    });
    it("should throw an error if payment is not found", async () => {
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(null);

      await expect(repository.refund("PY-001")).rejects.toThrowError(
        "Payment not found",
      );
    });
    it.skip("should throw an error if refunding payment in provider fails", async () => {
      const payment = {
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
        schedules: [
          {
            id: "SC-001",
            schedule_date: "2021-12-31",
            amount: 100,
            status: PaymentStatus.PENDING,
            invoices: [
              {
                id: "IN-001",
                amount: 100,
                status: PaymentStatus.COMPLETED,
                transaction_id: "TX-001",
              },
            ],
          },
        ],
      };
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );
      vi.spyOn(provider, "getProvider").mockReturnValue({
        refundCharge: vi.fn().mockRejectedValue(new Error("Error")),
      } as unknown as IPaymentProvider);

      await expect(repository.refund("PY-001")).rejects.toThrowError(
        "Error refunding payment in provider",
      );

      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "PY-001" },
        relations: ["schedules"],
      });
      expect(provider.getProvider).toHaveBeenCalledWith(
        "LAWPAY",
        "TEST_TENANT",
      );
    });
    it.skip("should refund all completed invoices", async () => {
      const payment = {
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
        schedules: [
          {
            id: "SC-001",
            schedule_date: "2021-12-31",
            amount: 100,
            status: PaymentStatus.PENDING,
            invoices: [
              {
                id: "IN-001",
                amount: 100,
                status: PaymentStatus.COMPLETED,
                transaction_id: "TX-001",
              },
              {
                id: "IN-002",
                amount: 50,
                status: PaymentStatus.COMPLETED,
                transaction_id: "TX-002",
              },
            ],
          },
        ],
      };
      vi.spyOn(paymentRepository, "findOne").mockResolvedValue(
        payment as unknown as PaymentEntity,
      );
      const refundChargeMock = vi.fn().mockResolvedValue(true);
      vi.spyOn(provider, "getProvider").mockReturnValue({
        refundCharge: refundChargeMock,
      } as unknown as IPaymentProvider);
      const response = await repository.refund("PY-001");

      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "PY-001" },
        relations: ["schedules"],
      });
      expect(provider.getProvider).toHaveBeenCalledWith(
        "LAWPAY",
        "TEST_TENANT",
      );
      expect(response.status).toBe(PaymentStatus.REFUNDED);
      expect(response.schedules[0].status).toBe(PaymentStatus.REFUNDED);
      expect(response.schedules[0].invoices[0].status).toBe(
        PaymentStatus.REFUNDED,
      );
      expect(response.schedules[0].invoices[1].status).toBe(
        PaymentStatus.REFUNDED,
      );
    });
  });
});
