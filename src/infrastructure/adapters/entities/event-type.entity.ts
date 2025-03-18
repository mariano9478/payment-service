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
import { ProviderEntity } from "./provider.entity";

@Entity({ name: "event_type", schema: "pay" })
export class EventTypeEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar", length: 255 })
  id!: string;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @OneToMany(() => EventEntity, event => event.eventType)
  events!: Relation<EventEntity[]>;

  @ManyToMany(() => ProviderEntity, provider => provider.eventTypes)
  @JoinTable({
    name: "event_provider",
    schema: "pay",
    joinColumn: {
      name: "event_type_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "provider_id",
      referencedColumnName: "id",
    },
  })
  providers!: Relation<ProviderEntity[]>;

  @CreateDateColumn({ type: "datetimeoffset", nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: "datetimeoffset", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "datetimeoffset", nullable: true })
  deletedAt?: Date;
}
