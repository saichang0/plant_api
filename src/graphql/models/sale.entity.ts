import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { Customers } from "./customer.entity.js";
import { Users } from "./user.entity.js";
import { SaleDetails } from "./saleDetail.entity.js";
import { Payments } from "./payment.entity.js";
import { Deliveries } from "./delivery.entity.js";
import { ProductReviews } from "./productReview.entity.js";

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    customerId: string;

    @Column('uuid')
    userId: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    saleDate: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ type: 'varchar' })
    status: string; // pending, paid, completed

    // Relations
    @ManyToOne(() => Customers, (customer) => customer.sales)
    customer: Customers;

    @ManyToOne(() => Users, (user) => user.sales)
    user: Users;

    @OneToMany(() => SaleDetails, (detail) => detail.sale)
    saleDetails: SaleDetails[];

    @OneToMany(() => Payments, (payment) => payment.sale)
    payments: Payments[];

    @OneToMany(() => Deliveries, (delivery) => delivery.sale)
    deliveries: Deliveries[];

    @OneToMany(() => ProductReviews, (review) => review.sale)
    productReviews: ProductReviews[];
}
