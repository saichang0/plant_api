import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { PurchaseOrders } from "./purchaseOrder.entity.js";
import { Users } from "./user.entity.js";
import { StockReceptionDetails } from "./stockReceptionDetail.entity.js";

@Entity('stock_receptions')
export class StockReceptions {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { nullable: true })
    purchaseOrderId: string;

    @Column('uuid')
    userId: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    receptionDate: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalActualPrice: number;

    // Relations
    @ManyToOne(() => PurchaseOrders, (order) => order.stockReceptions)
    purchaseOrder: PurchaseOrders;

    @ManyToOne(() => Users)
    user: Users;

    @OneToMany(() => StockReceptionDetails, (detail) => detail.reception)
    stockReceptionDetails: StockReceptionDetails[];
}
