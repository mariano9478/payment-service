import { TriggerModel } from "./trigger.model";

export class EventModel {
  id: string;
  name: string;
  trigger!: TriggerModel[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
