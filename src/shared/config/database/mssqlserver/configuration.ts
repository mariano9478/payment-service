import { registerAs } from "@nestjs/config";

export default registerAs("db", () => ({
  local: process.env.DB_LOCAL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  user: process.env.DB_USER || undefined,
  password: process.env.DB_PASSWORD || undefined,
  identityId: process.env.DB_IDENTITY_ID || undefined,
}));
