import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from "typeorm";

import { PaymentStatus } from "@src/domain/types/payment-status.type";

import { ScheduleEntity } from "./schedule.entity";

@Entity({ name: "invoice", schema: "pay" })
export class InvoiceEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar", length: 255 })
  id!: string;
  @Column({ type: "nvarchar", length: 255 })
  transaction_id!: string;
  @Column({ type: "nvarchar", length: 20 })
  status!: PaymentStatus;
  @Column({ type: "decimal", precision: 8, scale: 2 })
  amount!: number;
  @ManyToOne(() => ScheduleEntity, schedule => schedule.invoices)
  @JoinColumn({ name: "schedule_id" })
  schedule!: Relation<ScheduleEntity>;
}
