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
import { PaymentEntity } from "./payment.entity";
import { ProviderEntity } from "./provider.entity";

@Entity({ name: "tenant", schema: "pay" })
export class TenantEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar", length: 255 })
  id!: string;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @OneToMany(() => EventEntity, event => event.tenant)
  events!: Relation<EventEntity[]>;

  @OneToMany(() => PaymentEntity, payment => payment.tenant)
  payments!: Relation<PaymentEntity[]>;

  @ManyToMany(() => ProviderEntity, provider => provider.tenants)
  @JoinTable({
    name: "tenant_provider",
    schema: "pay",
    joinColumn: { name: "tenant_id" },
    inverseJoinColumn: { name: "provider_id" },
  })
  providers!: Relation<ProviderEntity[]>;

  @CreateDateColumn({ type: "datetimeoffset", nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: "datetimeoffset", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "datetimeoffset", nullable: true })
  deletedAt?: Date;
}
