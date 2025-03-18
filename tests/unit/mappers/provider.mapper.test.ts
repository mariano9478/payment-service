import { ProviderModel } from "../../../src/domain/models/provider.model";
import { ProviderEntity } from "../../../src/infrastructure/adapters/entities/provider.entity";
import { ProviderMapper } from "../../../src/infrastructure/mappers/provider.mapper";

describe("ProviderMapper", () => {
  it("should map ProviderEntity to ProviderModel correctly", () => {
    const entity: ProviderEntity = {
      id: "1",
      name: "Provider Name",
    } as ProviderEntity;
    const expectedModel: ProviderModel = new ProviderModel(
      "1",
      "Provider Name",
    );
    const result = ProviderMapper.toDomain(entity);
    expect(result).toEqual(expectedModel);
  });
});
