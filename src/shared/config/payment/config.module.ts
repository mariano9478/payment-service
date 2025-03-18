/* eslint-disable unicorn/no-null */
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { ENVIRONMENT_PATH } from "src/shared/constants/constants";
import { getEnvironmentPath } from "src/shared/helpers/environment.helper";

import { PaymentConfigService } from "./config.service";
import configuration from "./configuration";

const envFilePath: string = getEnvironmentPath(ENVIRONMENT_PATH);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [configuration],
      validationSchema: Joi.object({
        ST_LAWPAY_CLIENT_ID: Joi.string().required(),
        ST_LAWPAY_CLIENT_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, PaymentConfigService],
  exports: [ConfigService, PaymentConfigService],
})
export class PaymentConfigModule {}
