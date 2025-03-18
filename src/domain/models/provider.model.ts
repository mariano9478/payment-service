import { ApiProperty } from "@nestjs/swagger";

export class ProviderModel {
  @ApiProperty({ name: "id", type: "string", example: "P-001" })
  id: string;
  @ApiProperty({ name: "name", type: "string", example: "PROVIDER_NAME" })
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
