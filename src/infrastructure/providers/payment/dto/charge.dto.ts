import { IsNumber, IsOptional, IsString } from "class-validator";

export class ChargeDto {
  @IsNumber()
  amount!: number;
  @IsString()
  method!: string;
  @IsString()
  method_type: "CARD" | "BANK" = "CARD";
  @IsOptional()
  reference?: Record<string, unknown>;
}
