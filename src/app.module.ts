import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
// eslint-disable-next-line node/no-extraneous-import
import { v4 as uuidv4 } from "uuid";

import { ApplicationModule } from "./application/application.module";
import { DomainModule } from "./domain/domain.module";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { AppConfigModule } from "./shared/config/app/config.module";
import { EnvConfigModule } from "./shared/config/env/env.module";
import { ResponsesModule } from "./shared/responses/responses.module";
@Module({
  imports: [
    ResponsesModule,
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    AppConfigModule,
    EnvConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.get("LOG_LEVEL"),
            genReqId: function (req, res) {
              const existingID = req.id ?? req.headers["x-request-id"];
              if (existingID) return existingID;
              const id = uuidv4();
              res.setHeader("X-Request-Id", id);
              return id;
            },
            customLogLevel: function (req, res, err) {
              if (res.statusCode >= 400 && res.statusCode < 500) {
                return "warn";
              } else if (res.statusCode >= 500 || err) {
                return "error";
              } else if (res.statusCode >= 300 && res.statusCode < 400) {
                return "silent";
              }
              return "info";
            },
            customSuccessMessage: function (req) {
              return `Request ${String(req.id)} has been successfully processed`;
            },
            customReceivedMessage: function (req) {
              return "request received: " + req.method;
            },
            customErrorMessage: function (req, res, err) {
              return `request ${String(req.id)} errored with status code: ${res.statusCode} - ${err.message}`;
            },
            bindings: (bindings: { pid: unknown }) => ({ pid: bindings.pid }),
            customAttributeKeys: {
              req: "request",
              res: "response",
              err: "error",
              responseTime: "timeTaken",
            },
            autoLogging: true,
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
                levelFirst: true,
                translateTime: "yyyy-mm-dd HH:MM:ss.l",
                ignore: "pid,hostname",
                messageFormat: "{method} {url} {msg} - {res.statusCode}",
                customColors: "error:red,info:green,debug:cyan,warn:yellow",
              },
            },
            serializers: {
              req: (req: { id: string; method: string; url: string }) => ({
                id: req.id,
                method: req.method,
                url: req.url,
              }),
              res: (res: { statusCode: number }) => ({
                statusCode: res.statusCode,
              }),
            },
          },
        };
      },
    }),
    DomainModule,
    ApplicationModule,
    InfrastructureModule,
  ],
})
export class AppModule {}
