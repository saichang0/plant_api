import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Products } from "./product.entity.js";
import { Customers } from "./customer.entity.js";

/// A single "view" event on a product. Created whenever a customer opens
/// the product detail screen or adds the product to their wishlist.
@Entity('product_views')
export class ProductViews {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  productId: string;

  @Column("uuid")
  customerId: string;

  // 'detail' | 'wishlist'
  @Column({ type: 'varchar', length: 32, default: 'detail' })
  source: string;

  @ManyToOne(() => Products, (product) => product.productViews)
  @JoinColumn({ name: 'productId' })
  product: Products;

  @ManyToOne(() => Customers)
  @JoinColumn({ name: 'customerId' })
  customer: Customers;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
