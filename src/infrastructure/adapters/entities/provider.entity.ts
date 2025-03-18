import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { EventEntity } from "./event.entity";
import { EventTypeEntity } from "./event-type.entity";
import { PaymentEntity } from "./payment.entity";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: "provider", schema: "pay" })
export class ProviderEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar", length: 255 })
  id!: string;
  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @ManyToMany(() => EventTypeEntity, eventType => eventType.providers)
  @JoinTable({
    name: "event_provider",
    schema: "pay",
    joinColumn: {
      name: "provider_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "event_type_id",
      referencedColumnName: "id",
    },
  })
  eventTypes!: Relation<EventEntity[]>;

  @OneToMany(() => PaymentEntity, payment => payment.provider)
  payments!: Relation<PaymentEntity[]>;

  @ManyToMany(() => TenantEntity, tenant => tenant.providers)
  @JoinTable({
    name: "tenant_provider",
    schema: "pay",
    joinColumn: { name: "provider_id" },
    inverseJoinColumn: { name: "tenant_id" },
  })
  tenants!: Relation<TenantEntity[]>;

  @CreateDateColumn({ type: "datetimeoffset", nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: "datetimeoffset", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "datetimeoffset", nullable: true })
  deletedAt?: Date;
}
