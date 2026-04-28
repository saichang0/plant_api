import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Wishlists } from "./wishList.entity.js";
import { ProductReviews } from "./productReview.entity.js";
import { ProductViews } from "./productView.entity.js";
import { SaleDetails } from "./saleDetail.entity.js";
import { PurchaseOrderDetails } from "./purchaseOrderDetail.entity.js";
import { StockReceptionDetails } from "./stockReceptionDetail.entity.js";
import { Categories } from "./category.entity.js";
import { Units } from "./unit.entity.js";
import { Users } from "./user.entity.js";

@Entity('products')
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size?: string;

  @Column({ type: 'int', nullable: true })
  ageMonths?: number;

  @Column({ type: 'uuid', nullable: true })
  unitId?: string;

  // Weight per unit in grams (e.g., 1 bag = 50000g = 50kg)
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weightPerUnit?: number;

  @ManyToOne(() => Units, (unit) => unit.products)
  @JoinColumn({ name: 'unitId' })
  unit: Units;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  // Stock in grams for weight-based products
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  stockWeight: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salePrice: number;

  // Price per half-bag (optional, falls back to salePrice / 2)
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  pricePerHalfBag?: number;

  // Price per 12kg bundle (optional custom price)
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  pricePer12Kg?: number;

  // Price per kg (for weight-based selling)
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  pricePerKg?: number;

  @Column({ type: 'boolean', default: true })
  isPopular: boolean;

  @Column({ type: 'boolean', default: false })
  isSpecialOffer: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount?: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Number of times the product detail page was viewed (or added to wishlist)
  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @ManyToOne(() => Categories, (cat) => cat.products)
  category: Categories;

  @OneToMany(() => Wishlists, (wishlist) => wishlist.product)
  wishlists: Wishlists[];

  @OneToMany(() => ProductReviews, (productReview) => productReview.product)
  productReviews: ProductReviews[];

  @OneToMany(() => ProductViews, (productView) => productView.product)
  productViews: ProductViews[];

  @OneToMany(() => SaleDetails, (saleDetail) => saleDetail.product)
  saleDetails: SaleDetails[];

  @OneToMany(() => PurchaseOrderDetails, (pod) => pod.product)
  purchaseOrderDetails: PurchaseOrderDetails[];

  @OneToMany(() => StockReceptionDetails, (srd) => srd.product)
  stockReceptionDetails: StockReceptionDetails[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: Users;

  @Column({ type: 'uuid', nullable: true })
  deletedBy?: string;
}
