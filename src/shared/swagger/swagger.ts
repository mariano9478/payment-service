import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { VERSION } from "../constants/constants";

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Payment Service")
    .setDescription(
      "This service provide the necessary endpoints to manage payments from multiple sources and providers.",
    )
    .setVersion(VERSION)
    //.addCookieAuth("session")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(":version/docs", app, document);
};
