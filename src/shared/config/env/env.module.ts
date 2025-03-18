import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ENVIRONMENT_PATH } from "src/shared/constants/constants";
import { getEnvironmentPath } from "src/shared/helpers/environment.helper";

import { EnvConfigService } from "./config.service";
import configuration from "./configuration";

const envFilePath: string = getEnvironmentPath(ENVIRONMENT_PATH);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [configuration],
    }),
  ],
  providers: [ConfigService, EnvConfigService],
  exports: [ConfigService, EnvConfigService],
})
export class EnvConfigModule {}
