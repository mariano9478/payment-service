export class LawPayWebhookDto {
  id!: string;
  created!: Date;
  type!: string;
  data!: {
    status: string;
    created: Date;
    id: string;
    reference: Record<string, unknown>;
    failure_code?: string;
  };
}
