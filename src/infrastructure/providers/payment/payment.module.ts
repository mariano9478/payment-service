import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProviderEntity } from "@src/infrastructure/adapters/entities/provider.entity";
import { TenantEntity } from "@src/infrastructure/adapters/entities/tenant.entity";

import { PaymentConfigModule } from "./../../../shared/config/payment/config.module";
import { KeyVaultConfigModule } from "./../../../shared/config/secrets/keyvault/config.module";
import { PaymentOrchestrator } from "./payment-orchestrator";

@Module({
  imports: [
    PaymentConfigModule,
    KeyVaultConfigModule,
    TypeOrmModule.forFeature([TenantEntity, ProviderEntity]),
  ],
  providers: [PaymentOrchestrator],
  exports: [PaymentOrchestrator],
})
export class PaymentModule {}
