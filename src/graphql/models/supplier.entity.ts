import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { PurchaseOrders } from "./purchaseOrder.entity.js";

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
}
