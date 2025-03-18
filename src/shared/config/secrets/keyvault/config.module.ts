import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { ENVIRONMENT_PATH } from "src/shared/constants/constants";
import { getEnvironmentPath } from "src/shared/helpers/environment.helper";

import { KeyVaultConfigService } from "./config.service";
import configuration from "./configuration";

const envFilePath: string = getEnvironmentPath(ENVIRONMENT_PATH);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [configuration],
      validationSchema: Joi.object({
        KEYVAULT_URL: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, KeyVaultConfigService],
  exports: [ConfigService, KeyVaultConfigService],
})
export class KeyVaultConfigModule {
  private secretCache: Map<string, string>;
  private credential: DefaultAzureCredential;
  private client: SecretClient;

  constructor(configService: KeyVaultConfigService) {
    this.secretCache = new Map<string, string>();

    this.credential = new DefaultAzureCredential();
    this.client = new SecretClient(configService.keyVaultUrl, this.credential);
  }

  async getKeyVaultSecret(secretKey: string): Promise<string> {
    if (this.secretCache.has(secretKey)) {
      const secretFromCache = this.secretCache.get(secretKey) ?? "";
      return secretFromCache;
    }

    const secret = await this.client.getSecret(secretKey);
    const secretFromKeyvault = secret.value ?? "";

    if (secretFromKeyvault.length === 0) {
      throw new Error("Key doesn't exist");
    }

    this.secretCache.set(secretKey, secretFromKeyvault);

    return secretFromKeyvault;
  }
}
