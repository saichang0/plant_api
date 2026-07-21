import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Customers } from "./customer.entity.js";
import { Users } from "./user.entity.js";
import { SaleDetails } from "./saleDetail.entity.js";
import { Payments } from "./payment.entity.js";
import { Deliveries } from "./delivery.entity.js";
import { ProductReviews } from "./productReview.entity.js";
import { CustomerAddresses } from "./customerAddress.entity.js";

export enum SaleSource {
    PLENT_WEB = 'PLENT_WEB',
    PLENT_APP = 'PLENT_APP',
}

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
    code?: string;

    @Column({ type: 'uuid', nullable: true })
    customerId?: string;

    @Column('uuid')
    userId: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    saleDate: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalAmount: number;

    @Column({ type: 'int', default: 0 })
    totalPlant: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ type: 'varchar', default: 'pending' })
    status: string; // pending, paid, completed, cancelled, draft

    // Where the order was created. PLENT_APP = mobile customer app,
    // PLENT_WEB = POS / web shop dashboard.
    @Column({ type: 'enum', enum: SaleSource, default: SaleSource.PLENT_WEB })
    source: SaleSource;

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

    @Column({ type: 'timestamp', nullable: true })
    confirmedAt?: Date;

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
