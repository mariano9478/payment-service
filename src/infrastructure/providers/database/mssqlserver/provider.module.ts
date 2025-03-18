import { Module } from "@nestjs/common";
import {
  TypeOrmModule,
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { SqlServerConnectionOptions } from "typeorm/driver/sqlserver/SqlServerConnectionOptions";

import { DBConfigModule } from "@src/shared/config/database/mssqlserver/config.module";
import { DBConfigService } from "@src/shared/config/database/mssqlserver/config.service";
import { KeyVaultConfigModule } from "@src/shared/config/secrets/keyvault/config.module";
import { KeyVaultConfigService } from "@src/shared/config/secrets/keyvault/config.service";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DBConfigModule, KeyVaultConfigModule],
      useFactory: async (
        dbConfigService: DBConfigService,
        keyvaultService: KeyVaultConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const isLocalDB = dbConfigService.isLocal;
        const typeormConfig: SqlServerConnectionOptions = {
          type: "mssql",
          host: isLocalDB
            ? dbConfigService.host || "defaultHost"
            : String(
                await keyvaultService.getKeyVaultSecret(dbConfigService.host),
              ) || "defaultHost",
          port: dbConfigService.port || 1433,
          database: isLocalDB
            ? dbConfigService.database || "defaultDatabase"
            : String(
                await keyvaultService.getKeyVaultSecret(
                  dbConfigService.database,
                ),
              ) || "defaultDatabase",
          synchronize: false,
          extra: {
            trustServerCertificate: true,
            ...(dbConfigService.useManagedIdentity && {
              authentication: {
                type: "azure-active-directory-msi-app-service",
                options: {
                  clientId: String(
                    (await keyvaultService.getKeyVaultSecret(
                      dbConfigService.identityId,
                    )) || "",
                  ),
                },
              },
            }),
          },
          ...(dbConfigService.useManagedIdentity
            ? {}
            : {
                username: isLocalDB
                  ? dbConfigService.user || "defaultUser"
                  : String(
                      await keyvaultService.getKeyVaultSecret(
                        dbConfigService.user,
                      ),
                    ) || "defaultUser",
                password: isLocalDB
                  ? dbConfigService.password || "defaultPassword"
                  : String(
                      await keyvaultService.getKeyVaultSecret(
                        dbConfigService.password,
                      ),
                    ) || "defaultPassword",
              }),
        };

        const nestjsConfig: TypeOrmModuleOptions = {
          ...typeormConfig,
          autoLoadEntities: true,
        };

        return nestjsConfig;
      },
      inject: [DBConfigService, KeyVaultConfigService],
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class MSSqlServerDatabaseProviderModule {}
