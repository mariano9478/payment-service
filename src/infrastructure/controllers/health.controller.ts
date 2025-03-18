import { Controller, Get, HttpCode } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("health")
@ApiTags("Health")
export class HealthController {
  @Get()
  @ApiOperation({
    summary: "Health Check",
    description: "Health Check",
  })
  @HttpCode(200)
  healthCheck() {
    return "OK";
  }
}
