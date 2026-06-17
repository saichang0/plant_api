import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./user.entity.js";

@Entity('bank_accounts')
export class BankAccounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  bankName: string;

  @Column({ type: 'text' })
  qrImageUrl: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
