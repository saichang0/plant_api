import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Products } from "./product.entity.js";
import { Customers } from "./customer.entity.js";
import { Sale } from "./sale.entity.js";

@Entity('product_reviews')
export class ProductReviews {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column('uuid')
    productId: string;

    @Column('uuid')
    customerId: string;

    @Column('uuid')
    saleId: string;

    @ManyToOne(() => Products, (product) => product.productReviews)
    product: Products;

    @ManyToOne(() => Customers, (customer) => customer.productReviews)
    customer: Customers;

    @ManyToOne(() => Sale, (sale) => sale.productReviews)
    sale: Sale;

    @Column({ type: 'int', comment: '1-5 stars' })
    rating: number;

    @Column({ type: 'text' })
    comment: string;

    @Column({ type: 'boolean', default: false })
    isVerifiedPurchase: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    updatedAt: Date;
}