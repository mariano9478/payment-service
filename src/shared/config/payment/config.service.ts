import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PaymentConfigService {
  constructor(private configService: ConfigService) {}

  getEnvVariable(tenant: string, provider: string, variable: string): string {
    return (
      this.configService.get<string>(
        `payment.${provider}.${tenant}.${variable}`,
      ) ?? ""
    );
  }

  getClientId(tenant: string, provider: string): string {
    return this.getEnvVariable(tenant, provider, "client_id");
  }

  getClientSecret(tenant: string, provider: string): string {
    return this.getEnvVariable(tenant, provider, "client_secret");
  }

  getAccount(tenant: string, provider: string, name: string): string {
    return this.getEnvVariable(
      tenant,
      provider,
      `ACCOUNT_${name.toUpperCase()}`,
    );
  }

  get isLocal(): boolean {
    return this.configService.get<boolean>("payment.is_local") ?? false;
  }
}
