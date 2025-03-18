import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";

import { PaymentEntity } from "./payment.entity";

@Entity({ name: "method", schema: "pay" })
export class MethodEntity extends BaseEntity {
  @PrimaryColumn({ type: "nvarchar" })
  @Generated("uuid")
  id!: string;

  @Column({ type: "nvarchar", length: 255 })
  status!: string;

  @Column({ type: "nvarchar", length: 255 })
  token!: string;

  @Column({ type: "nvarchar", length: 255 })
  method_type!: "CARD" | "BANK";

  @ManyToOne(() => PaymentEntity, payment => payment.methods, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "payment_id" })
  payment!: Relation<PaymentEntity>;

  @CreateDateColumn({ type: "datetimeoffset", nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: "datetimeoffset", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "datetimeoffset", nullable: true })
  deletedAt?: Date;
}
