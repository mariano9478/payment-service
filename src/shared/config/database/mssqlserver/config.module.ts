/* eslint-disable unicorn/no-null */
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { ENVIRONMENT_PATH } from "src/shared/constants/constants";
import { getEnvironmentPath } from "src/shared/helpers/environment.helper";

import { DBConfigService } from "./config.service";
import configuration from "./configuration";

const envFilePath: string = getEnvironmentPath(ENVIRONMENT_PATH);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [configuration],
      validationSchema: Joi.object({
        DB_NAME: Joi.string(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.number().default(1433),
        DB_USER: Joi.string().allow(null, ""),
        DB_PASSWORD: Joi.string().allow(null, ""),
        DB_IDENTITY_ID: Joi.string().optional(),
      }),
    }),
  ],
  providers: [ConfigService, DBConfigService],
  exports: [ConfigService, DBConfigService],
})
export class DBConfigModule {}
