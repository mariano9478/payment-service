import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DomainModule } from "src/domain/domain.module";

import { EventEntity } from "@src/infrastructure/adapters/entities/event.entity";
import { EventTypeEntity } from "@src/infrastructure/adapters/entities/event-type.entity";
import { InvoiceEntity } from "@src/infrastructure/adapters/entities/invoice.entity";
import { MethodEntity } from "@src/infrastructure/adapters/entities/method.entity";
import { PaymentEntity } from "@src/infrastructure/adapters/entities/payment.entity";
import { ProviderEntity } from "@src/infrastructure/adapters/entities/provider.entity";
import { ScheduleEntity } from "@src/infrastructure/adapters/entities/schedule.entity";
import { TenantEntity } from "@src/infrastructure/adapters/entities/tenant.entity";
import { PaymentRepository } from "@src/infrastructure/adapters/repository/payment.repository";
import { PaymentModule } from "@src/infrastructure/providers/payment/payment.module";

import PAYMENT_USECASE from "./usecases/payment";

@Module({
  imports: [
    DomainModule,
    TypeOrmModule.forFeature([
      TenantEntity,
      ProviderEntity,
      EventEntity,
      PaymentEntity,
      EventTypeEntity,
      ScheduleEntity,
      InvoiceEntity,
      MethodEntity,
    ]),
    PaymentModule,
  ],
  providers: [
    ...PAYMENT_USECASE,
    { provide: "IPaymentRepository", useClass: PaymentRepository },
  ],
  exports: [...PAYMENT_USECASE],
})
export class ApplicationModule {}
