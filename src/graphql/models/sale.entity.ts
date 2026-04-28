import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Customers } from "./customer.entity.js";
import { Users } from "./user.entity.js";
import { SaleDetails } from "./saleDetail.entity.js";
import { Payments } from "./payment.entity.js";
import { Deliveries } from "./delivery.entity.js";
import { ProductReviews } from "./productReview.entity.js";
import { CustomerAddresses } from "./customerAddress.entity.js";

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Optional: walk-in customers don't need an account
    @Column({ type: 'uuid', nullable: true })
    customerId?: string;

    @Column('uuid')
    userId: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    saleDate: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ type: 'varchar', default: 'pending' })
    status: string; // pending, paid, completed, cancelled, draft

    // Walk-in customer name (no account needed)
    @Column({ type: 'varchar', length: 255, nullable: true })
    customerName?: string;

    @Column({ type: 'text', nullable: true })
    note?: string;

    // Shipping address for customer orders (nullable for walk-in POS sales)
    @Column({ type: 'uuid', nullable: true })
    customerAddressId?: string;

    @ManyToOne(() => CustomerAddresses, { nullable: true })
    @JoinColumn({ name: 'customerAddressId' })
    customerAddress?: CustomerAddresses;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Customers, (customer) => customer.sales, { nullable: true })
    customer: Customers;

    @ManyToOne(() => Users, (user) => user.sales)
    user: Users;

    @OneToMany(() => SaleDetails, (detail) => detail.sale, { cascade: true })
    saleDetails: SaleDetails[];

    @OneToMany(() => Payments, (payment) => payment.sale, { cascade: true })
    payments: Payments[];

    @OneToMany(() => Deliveries, (delivery) => delivery.sale)
    deliveries: Deliveries[];

    @OneToMany(() => ProductReviews, (review) => review.sale)
    productReviews: ProductReviews[];
}
