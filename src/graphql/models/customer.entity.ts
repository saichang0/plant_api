import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany, UpdateDateColumn } from "typeorm";
import { Sale } from "./sale.entity.js";
import { Wishlists } from "./wishList.entity.js";
import { ProductReviews } from "./productReview.entity.js";

@Entity('customers')
export class Customers {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    firstName: string;

    @Column({ type: 'varchar', length: 50 })
    lastName: string;

    @Column({ type: 'text', nullable: true })
    profileImageUrl?: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    password?: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ type: 'varchar', length: 6, nullable: true })
    otp?: string;

    @Column({ type: 'timestamp', nullable: true })
    otpExpiry?: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Sale, (sale) => sale.customer)
    sales: Sale[];

    @OneToMany(() => Wishlists, (wishlist) => wishlist.customer)
    wishlists: Wishlists[];

    @OneToMany(() => ProductReviews, (review) => review.customer)
    productReviews: ProductReviews[];
}
