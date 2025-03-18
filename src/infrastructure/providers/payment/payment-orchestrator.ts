const paymentProvidersList = ["LAWPAY", "STRIPE"] as const;

export { paymentProvidersList };

import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ProviderEntity } from "@src/infrastructure/adapters/entities/provider.entity";
import { PaymentConfigService } from "@src/shared/config/payment/config.service";
import { KeyVaultConfigService } from "@src/shared/config/secrets/keyvault/config.service";

import { LawPayProvider } from "./implementations/LawPay/lawpay.provider";
import { IPaymentProvider } from "./payment.interface";

export class PaymentOrchestrator {
  private readonly logger = new Logger(PaymentOrchestrator.name);
  private providers: {
    provider: keyof typeof paymentProvidersList;
    tenant: string;
    instance: IPaymentProvider;
  }[] = [];

  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
    private readonly paymentConfigService: PaymentConfigService,
    private readonly keyvaultConfigService: KeyVaultConfigService,
  ) {
    this.logger.log("Initializing Payment Providers");
    this.init()
      .then(() => {
        this.logger.log("Payment Providers initialized");
      })
      .catch(error => {
        this.logger.error(error, `Error initializing payment providers`);
      });
  }
  async init() {
    const providers = await this.providerRepository.find({
      relations: {
        tenants: true,
      },
    });
    for (const provider of providers) {
      for (const tenant of provider.tenants) {
        let instance: IPaymentProvider;
        switch (provider.name) {
          case "LAWPAY": {
            instance = new LawPayProvider(
              tenant.name,
              this.paymentConfigService,
              this.keyvaultConfigService,
            );
            break;
          }
          default: {
            throw new Error(`Provider ${provider.name} not found`);
          }
        }
        this.providers.push({
          provider: provider.name as keyof typeof paymentProvidersList,
          tenant: tenant.name,
          instance,
        });
      }
    }
  }

  getProvider(providerName: string, tenantName: string): IPaymentProvider {
    this.logger.log(
      `Getting provider ${providerName} for tenant ${tenantName}`,
    );
    const provider = this.providers.find(
      p => p.provider === providerName && p.tenant === tenantName,
    );
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return provider.instance;
  }
}
