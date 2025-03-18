import { IsEmail, IsOptional, IsString } from "class-validator";

export class ClientDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsEmail()
  email!: string;
}
