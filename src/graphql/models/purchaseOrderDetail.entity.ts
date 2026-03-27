import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { PurchaseOrders } from "./purchaseOrder.entity.js";
import { Products } from "./product.entity.js";

@Entity('purchaseOrderDetails')
export class PurchaseOrderDetails {
    @PrimaryGeneratedColumn('uuid'  )
    id: string;

    @Column('uuid')
    orderId: string;

    @Column('uuid')
    productId: string;

    @Column('int')
    quantity: number;

    // Relations
    @ManyToOne(() => PurchaseOrders, (order) => order.purchaseOrderDetails)
    order: PurchaseOrders;

    @ManyToOne(() => Products, (product) => product.purchaseOrderDetails)
    product: Products;
}
