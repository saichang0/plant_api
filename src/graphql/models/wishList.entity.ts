import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne } from "typeorm";
import { Products } from "./product.entity.js";
import { Customers } from "./customer.entity.js";

@Entity('wishlists')
export class Wishlists {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  customerId: string;

  @Column("uuid")
  productId: string;

  @ManyToOne(() => Products, (product) => product.wishlists)
  product: Products;

  @ManyToOne(() => Customers, (customer) => customer.wishlists)
  customer: Customers;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}