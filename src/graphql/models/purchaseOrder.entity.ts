import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { Suppliers } from "./supplier.entity.js";
import { Users } from "./user.entity.js";
import { PurchaseOrderDetails } from "./purchaseOrderDetail.entity.js";
import { StockReceptions } from "./stockReception.entity.js";

@Entity('purchase_orders')
export class PurchaseOrders {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    supplierId: string;

    @Column('uuid')
    userId: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    orderDate: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ type: 'varchar' })
    status: string; // pending, received, cancelled

    // Relations
    @ManyToOne(() => Suppliers, (supplier) => supplier.purchaseOrders)
    supplier: Suppliers;

    @ManyToOne(() => Users)
    user: Users;

    @OneToMany(() => PurchaseOrderDetails, (detail) => detail.order)
    purchaseOrderDetails: PurchaseOrderDetails[];

    @OneToMany(() => StockReceptions, (reception) => reception.purchaseOrder)
    stockReceptions: StockReceptions[];
}
