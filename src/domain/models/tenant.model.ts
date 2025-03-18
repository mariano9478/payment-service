import { ApiProperty } from "@nestjs/swagger";

import { EventModel } from "./event.model";

export class TenantModel {
  @ApiProperty({ name: "id", type: "string", example: "T-001" })
  id: string;
  @ApiProperty({ name: "name", type: "string", example: "TENANT_NAME" })
  name: string;
  @ApiProperty({ name: "events", type: [EventModel] })
  events!: EventModel[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
