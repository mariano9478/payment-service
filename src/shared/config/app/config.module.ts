import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { DEFAULT_PORT, ENVIRONMENT_PATH } from "src/shared/constants/constants";
import { getEnvironmentPath } from "src/shared/helpers/environment.helper";

import { AppConfigService } from "./config.service";
import configuration from "./configuration";

const envFilePath: string = getEnvironmentPath(ENVIRONMENT_PATH);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [configuration],
      validationSchema: Joi.object({
        APP_NAME: Joi.string(),
        APP_ENV: Joi.string()
          .valid(
            "local",
            "development",
            "testing",
            "staging",
            "production",
            "dev",
            "qa",
            "stg",
            "prd",
          )
          .default("development"),
        APP_URL: Joi.string(),
        APP_PORT: Joi.number().default(DEFAULT_PORT),
        SALESFORCE_SERVICE_URL: Joi.string(),
      }),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
