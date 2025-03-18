import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { PaymentStatus } from "@src/domain/types/payment-status.type";

import { InvoiceEntity } from "./invoice.entity";
import { PaymentEntity } from "./payment.entity";

@Entity({ name: "schedule", schema: "pay" })
export class ScheduleEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar" })
  @Generated("uuid")
  id!: string;
  @Column({ type: "datetimeoffset" })
  schedule_date!: Date;
  @Column({ type: "decimal", precision: 8, scale: 2 })
  amount!: number;
  @Column({ type: "nvarchar", length: 20 })
  status!: PaymentStatus;

  @ManyToOne(() => PaymentEntity, payment => payment.schedules)
  @JoinColumn({ name: "payment_id" })
  payment!: Relation<PaymentEntity>;
  @OneToMany(() => InvoiceEntity, invoice => invoice.schedule)
  invoices!: Relation<InvoiceEntity[]>;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
