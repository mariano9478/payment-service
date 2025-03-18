export class BankAccountPaymentMethodDto {
  routing_number!: string;
  account_number!: string;
  account_type!: "CHECKING" | "SAVINGS";
  name!: string;
  account_holder_type!: "individual" | "business";
}
