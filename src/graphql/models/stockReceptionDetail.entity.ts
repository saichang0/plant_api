import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { StockReceptions } from "./stockReception.entity.js";
import { Products } from "./product.entity.js";

@Entity('stock_reception_details')
export class StockReceptionDetails {
    @PrimaryGeneratedColumn('uuid'  )
    id: string;

    @Column('uuid')
    receptionId: string;

    @Column('uuid')
    productId: string;

    @Column('int')
    quantityReceived: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    actualCostPrice: number;

    @Column({ type: 'varchar' })
    status: string;

    // Relations
    @ManyToOne(() => StockReceptions, (reception) => reception.stockReceptionDetails)
    reception: StockReceptions;

    @ManyToOne(() => Products, (product) => product.stockReceptionDetails)
    product: Products;
}
