import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Sale } from "./sale.entity.js";
import { Products } from "./product.entity.js";

@Entity('saleDetails')
export class SaleDetails {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    saleId: string ;

    @Column('uuid')
    productId: string;

    @Column('int')
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @ManyToOne(() => Sale, (sale) => sale.saleDetails)
    sale: Sale;

    @ManyToOne(() => Products, (product) => product.saleDetails)
    product: Products;
}
