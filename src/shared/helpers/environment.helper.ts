import { existsSync } from "node:fs";
import path from "node:path";

export enum Environment {
  Development = "development",
  Production = "production",
  Staging = "staging",
  Test = "test",
}

export function getEnvironmentPath(dest: string): string {
  const env: string | undefined = process.env.APP_ENV;
  const fallback: string = path.resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : "development.env";
  let filePath: string = path.resolve(`${dest}/${filename}`);

  if (!existsSync(filePath)) {
    filePath = fallback;
  }

  return filePath;
}
