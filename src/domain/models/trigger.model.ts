import { ProviderModel } from "./provider.model";

export class TriggerModel {
  id: string;
  name: string;
  provider: ProviderModel;

  constructor(id: string, name: string, provider: ProviderModel) {
    this.id = id;
    this.name = name;
    this.provider = provider;
  }
}
