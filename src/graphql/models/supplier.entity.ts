import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { PurchaseOrders } from "./purchaseOrder.entity.js";
import { Users } from "./user.entity.js";

@Entity('suppliers')
export class Suppliers {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 20 })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 100 })
    email: string;

    @Column({ type: 'text' })
    address: string;

    // Relations
    @OneToMany(() => PurchaseOrders, (order) => order.supplier)
    purchaseOrders: PurchaseOrders[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt?: Date;

    @Column({ type: 'uuid', nullable: true })
    createdBy?: string;

    @ManyToOne(() => Users)
    @JoinColumn({ name: 'createdBy' })
    creator?: Users;

    @Column({ type: 'uuid', nullable: true })
    deletedBy?: string;
}
