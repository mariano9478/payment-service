import { ApiProperty } from "@nestjs/swagger";

export class BaseResponseDto {
  @ApiProperty({
    description: "The relevant id of the process",
    example: "123456",
  })
  transaction_id!: string;
  @ApiProperty({
    description: "The status of the process",
    example: "ERROR",
  })
  status!: string;
  @ApiProperty({
    description: "The message of the process",
    example: {
      method: "ERROR",
      client: "SAVED",
      method_error: "Card is expired",
    },
  })
  data: Record<string, unknown> = {};
}
