import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Sale } from './sale.entity.js';
import { PurchaseOrders } from './purchaseOrder.entity.js';
import { StockReceptions } from './stockReception.entity.js';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

@Entity('users')
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    firstName: string;

    @Column({ type: 'varchar', length: 50 })
    lastName: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    email?: string;

    @Column({ type: 'text', nullable: true })
    profileImageUrl?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    shopName?: string;

    @Column({ type: 'varchar', length: 20, default: 'staff' })
    role: string;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({ type: 'varchar', length: 6, nullable: true })
    otp?: string;

    @Column({ type: 'timestamp', nullable: true })
    otpExpiry?: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Sale, (sale) => sale.user)
    sales: Sale[];

    @OneToMany(() => PurchaseOrders, (po) => po.user)
    purchaseOrders: PurchaseOrders[];

    @OneToMany(() => StockReceptions, (reception) => reception.user)
    stockReceptions: StockReceptions[];
}
