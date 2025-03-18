import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import cookieSession from "cookie-session";
import helmet from "helmet";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";

import {
  DEFAULT_PORT,
  LOCALHOST,
  VERSION,
} from "@src/shared/constants/constants";
import { ResponseFormatInterceptor } from "@src/shared/interceptors/response-format.interceptor";
import { setupSwagger } from "@src/shared/swagger/swagger";

import { AppModule } from "./app.module";
import { AppConfigService } from "./shared/config/app/config.service";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.use(helmet());
  app.use(cookieSession({ name: "session", keys: ["secret"] }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  const logger = app.get(Logger);

  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.setGlobalPrefix("api");

  app.enableVersioning({
    defaultVersion: VERSION,
    type: VersioningType.URI,
  });
  setupSwagger(app);
  const configService = app.get(AppConfigService);
  const port = configService.port || DEFAULT_PORT.toString();

  await app.listen(port, LOCALHOST);

  logger.log(`App is ready and listening on port ${port} 🚀`);
}

bootstrap().catch(handleError);

function handleError(error: unknown) {
  // eslint-disable-next-line no-console
  console.error(error);
  throw error;
}

process.on("uncaughtException", handleError);
