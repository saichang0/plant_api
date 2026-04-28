import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Sale } from "./sale.entity.js";

export enum DeliveryStatus {
    PACKING = 'packing',
    SHIPPING = 'shipping',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered'
}

@Entity('deliveries')
export class Deliveries {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    saleId: string;

    @Column({ type: 'varchar', length: 100 })
    deliveryService: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    branch?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    trackingNumber?: string;

    @Column({ type: 'varchar', length: 20 })
    status: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    shippedAt?: Date;

    // Relations
    @ManyToOne(() => Sale, (sale) => sale.deliveries)
    sale: Sale;
}
