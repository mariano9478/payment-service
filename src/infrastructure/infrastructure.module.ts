import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApplicationModule } from "@src/application/application.module";
import { PaymentModel } from "@src/domain/models/payment.model";
import { PaymentConfigModule } from "@src/shared/config/payment/config.module";
import { PaymentConfigService } from "@src/shared/config/payment/config.service";
import { KeyVaultConfigModule } from "@src/shared/config/secrets/keyvault/config.module";

import { EventEntity } from "./adapters/entities/event.entity";
import { EventTypeEntity } from "./adapters/entities/event-type.entity";
import { InvoiceEntity } from "./adapters/entities/invoice.entity";
import { MethodEntity } from "./adapters/entities/method.entity";
import { PaymentEntity } from "./adapters/entities/payment.entity";
import { ProviderEntity } from "./adapters/entities/provider.entity";
import { ScheduleEntity } from "./adapters/entities/schedule.entity";
import { TenantEntity } from "./adapters/entities/tenant.entity";
import { InternalRepository } from "./adapters/repository/internal.repository";
import { PaymentRepository } from "./adapters/repository/payment.repository";
import { ExternalController } from "./controllers/external.controller";
import { HealthController } from "./controllers/health.controller";
import { InternalController } from "./controllers/internal.controller";
import { MSSqlServerDatabaseProviderModule } from "./providers/database/mssqlserver/provider.module";
import { LawPayProvider } from "./providers/payment/implementations/LawPay/lawpay.provider";
import { PaymentOrchestrator } from "./providers/payment/payment-orchestrator";
//import { MSSqlServerDatabaseProviderModule } from "@src/infrastructure/providers/database/mssqlserver/provider.module";

@Module({
  imports: [
    PaymentModel,
    ApplicationModule,
    MSSqlServerDatabaseProviderModule,
    CacheModule.register({
      ttl: 10, //life time of cache
      max: 100, // maximum number of items in cache
    }),
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
    PaymentConfigModule,
    KeyVaultConfigModule,
  ],
  providers: [
    InternalRepository,
    PaymentRepository,
    PaymentOrchestrator,
    PaymentConfigService,
    LawPayProvider,
  ],
  controllers: [ExternalController, InternalController, HealthController],
})
export class InfrastructureModule {}
