import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { EventTypeEntity } from "./event-type.entity";
import { TenantEntity } from "./tenant.entity";

@Entity({ name: "event", schema: "pay" })
export class EventEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar", length: 255 })
  id!: string;

  @Column({ type: "nvarchar", length: 255 })
  domain!: string;

  @Column({ type: "nvarchar", length: 255 })
  path!: string;

  @ManyToOne(() => TenantEntity, tenant => tenant.events)
  @JoinColumn({ name: "tenant_id" })
  tenant!: Relation<TenantEntity>;

  @ManyToOne(() => EventTypeEntity, eventType => eventType.events)
  @JoinColumn({ name: "event_type_id" })
  eventType!: Relation<EventTypeEntity>;

  @CreateDateColumn({ type: "datetimeoffset", nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: "datetimeoffset", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "datetimeoffset", nullable: true })
  deletedAt?: Date;
}
