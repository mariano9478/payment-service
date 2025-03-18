import { BankAccountPaymentMethodDto } from "./bank-method.dto";
import { CardPaymentMethodDto } from "./card-method.dto";

export class PaymentMethodDto {
  type!: "CARD" | "BANK_ACCOUNT";
  method_data!: CardPaymentMethodDto | BankAccountPaymentMethodDto;
}
