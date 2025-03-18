import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class PaymentIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Payment id", type: String, example: "PY001" })
  id!: string;
}
