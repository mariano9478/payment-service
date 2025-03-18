import { TenantModel } from "@src/domain/models/tenant.model";

import { TenantEntity } from "../adapters/entities/tenant.entity";

export class TenantMapper {
  public static toDomain(entity: TenantEntity): TenantModel {
    const tenant = new TenantModel(entity.id, entity.name);
    return tenant;
  }
}
