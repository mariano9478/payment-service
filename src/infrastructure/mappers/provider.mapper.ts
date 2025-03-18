import { ProviderModel } from "@src/domain/models/provider.model";

import { ProviderEntity } from "../adapters/entities/provider.entity";

export class ProviderMapper {
  public static toDomain(entity: ProviderEntity): ProviderModel {
    const provider = new ProviderModel(entity.id, entity.name);
    return provider;
  }
}
