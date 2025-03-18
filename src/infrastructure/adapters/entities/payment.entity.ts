import { Injectable } from "@nestjs/common";
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

import { MethodEntity } from "./method.entity";
import { ProviderEntity } from "./provider.entity";
import { ScheduleEntity } from "./schedule.entity";
import { TenantEntity } from "./tenant.entity";
@Injectable()
@Entity({ name: "payment", schema: "pay" })
export class PaymentEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar" })
  @Generated("uuid")
  id!: string;

  @Column({ type: "decimal", precision: 8, scale: 2 })
  amount!: number;

  @Column({ type: "datetimeoffset" })
  payment_date!: Date;

  @Column({ type: "int" })
  payment_split!: number;

  @Column({ type: "decimal", precision: 8, scale: 2 })
  base_payment!: number;

  @Column({ type: "decimal", precision: 8, scale: 2 })
  discount!: number;

  @Column({ type: "nvarchar", length: 10 })
  discount_type!: "percentage" | "fixed";

  @Column({ type: "nvarchar", length: 20 })
  status!: PaymentStatus;

  @Column({
    type: "text",
    transformer: {
      to: (value: object | null) => (value ? JSON.stringify(value) : undefined), // Convierte a texto antes de guardar
      from: (value: string | null): Record<string, unknown> =>
        value ? (JSON.parse(value) as Record<string, unknown>) : {}, // Convierte a objeto al leer
    },
  })
  metadata!: Record<string, unknown>;

  @OneToMany(() => MethodEntity, method => method.payment)
  methods!: Relation<MethodEntity[]>;

  @ManyToOne(() => ProviderEntity, provider => provider.payments)
  @JoinColumn({ name: "provider_id" })
  provider!: Relation<ProviderEntity>;

  @ManyToOne(() => TenantEntity, tenant => tenant.payments)
  @JoinColumn({ name: "tenant_id" })
  tenant!: Relation<TenantEntity>;

  @OneToMany(() => ScheduleEntity, schedule => schedule.payment, {
    cascade: true,
  })
  schedules!: Relation<ScheduleEntity[]>;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  external_id?: string;

  @CreateDateColumn({ type: "datetimeoffset", nullable: false })
  createdAt?: Date;

  @UpdateDateColumn({ type: "datetimeoffset", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "datetimeoffset", nullable: true })
  deletedAt?: Date;
}
