export class BasicResponseDto {
  transaction_id!: string;
  status!: string;
  data?: Record<string, unknown>;
}
