import { BasicResponseDto } from "./dto/basic-response.dto";
import { ChargeDto } from "./dto/charge.dto";
import { ClientDto } from "./dto/client.dto";
import { ScheduleDto } from "./dto/schedule.dto";

export interface IPaymentProvider {
  authenticated: boolean;
  createCharge(charge: ChargeDto): Promise<BasicResponseDto>;

  createRecurringCharge(
    amount: number,
    schedule: ScheduleDto,
    charge_id: string,
  ): Promise<BasicResponseDto>;

  cancelRecurringCharge(charge_id: string): Promise<BasicResponseDto>;

  refundCharge(charge_id: string): Promise<BasicResponseDto>;

  createClient(client: ClientDto): Promise<ClientDto>;
  addClientPaymentMethod(
    client: string,
    method: { token: string; type: "CARD" | "BANK" },
  ): Promise<string>;
}
