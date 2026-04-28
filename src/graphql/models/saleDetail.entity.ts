import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Sale } from "./sale.entity.js";
import { Products } from "./product.entity.js";
import { Units } from "./unit.entity.js";

@Entity('saleDetails')
export class SaleDetails {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    saleId: string;

    @Column('uuid')
    productId: string;

    // For piece/bag-based: number of items (e.g. 2 bags)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    quantity: number;

    @Column({ type: 'uuid', nullable: true })
    unitId?: string;

    // Weight in grams (for kg/gram sales). e.g. 2.5kg = 2500g
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    weightGrams: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalPrice: number;

    @Column({ type: 'text', nullable: true })
    note?: string;

    @ManyToOne(() => Sale, (sale) => sale.saleDetails)
    sale: Sale;

    @ManyToOne(() => Products, (product) => product.saleDetails)
    product: Products;

    @ManyToOne(() => Units, (unit) => unit.saleDetails)
    @JoinColumn({ name: 'unitId' })
    unit: Units;
}
