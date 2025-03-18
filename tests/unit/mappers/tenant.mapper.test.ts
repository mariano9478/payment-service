import { TenantModel } from "../../../src/domain/models/tenant.model";
import { TenantEntity } from "../../../src/infrastructure/adapters/entities/tenant.entity";
import { TenantMapper } from "../../../src/infrastructure/mappers/tenant.mapper";

describe("TenantMapper", () => {
  it("should map TenantEntity to TenantModel correctly", () => {
    const entity: TenantEntity = {
      id: "1",
      name: "Tenant Name",
    } as TenantEntity;
    const expectedModel: TenantModel = new TenantModel("1", "Tenant Name");
    const result = TenantMapper.toDomain(entity);
    expect(result).toEqual(expectedModel);
  });
});
