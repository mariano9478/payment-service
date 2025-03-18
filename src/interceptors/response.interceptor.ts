import { ApiResponse } from "@nestjs/swagger";

import { ResponseDto } from "@src/domain/dtos/out/response.dto";

export const ApiGlobalErrorResponse = () =>
  ApiResponse({
    status: "4XX",
    description: "Example General Error",
    type: ResponseDto,
  });
