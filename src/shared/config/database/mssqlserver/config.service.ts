import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DBConfigService {
  constructor(private configService: ConfigService) {}

  private getEnvVariable(variable: string): string {
    return this.configService.get<string>(`db.${variable}`) ?? "";
  }

  get isLocal(): boolean {
    return !!this.getEnvVariable("local");
  }

  get host(): string {
    return this.getEnvVariable("host");
  }

  get database(): string {
    return this.getEnvVariable("name");
  }

  get port(): number {
    return Number(this.getEnvVariable("port"));
  }

  get user(): string {
    return this.getEnvVariable("user") || "";
  }

  get password(): string {
    return this.getEnvVariable("password") || "";
  }

  get identityId(): string {
    return this.getEnvVariable("identityId") || "";
  }

  get useManagedIdentity(): boolean {
    return !this.user && !this.password && !!this.identityId;
  }
}
