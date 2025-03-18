import { ApiProperty } from "@nestjs/swagger";

export class CaptureDto {
  @ApiProperty({ description: "Client first name", example: "John" })
  client_first_name!: string;
  @ApiProperty({ description: "Client last name", example: "Doe" })
  client_last_name!: string;
  @ApiProperty({ description: "Client email", example: "john@test.com" })
  client_email!: string;
  @ApiProperty({ description: "Method token", example: "123456" })
  method_token!: string;
  @ApiProperty({ description: "Method type", example: "CARD" })
  method_type!: "CARD" | "BANK";
}
