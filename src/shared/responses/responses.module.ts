import { Global, Module } from "@nestjs/common";

import ResponsesService from "./responses.service";

@Global()
@Module({
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
