import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Wishlists } from "./wishList.entity.js";
import { ProductReviews } from "./productReview.entity.js";
import { SaleDetails } from "./saleDetail.entity.js";
import { PurchaseOrderDetails } from "./purchaseOrderDetail.entity.js";
import { StockReceptionDetails } from "./stockReceptionDetail.entity.js";
import { Categories } from "./category.entity.js";

@Entity('products')
export class Products {
  @PrimaryGeneratedColumn('uuid'  )
  id: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  variety?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size?: string;

  @Column({ type: 'int', nullable: true })
  ageMonths?: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salePrice: number;

  @Column({ type: 'boolean', default: false })
  isPopular: boolean;

  @Column({ type: 'boolean', default: false })
  isSpecialOffer: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage?: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'simple-array', nullable: true })
  imagePublicIds?: string[];

  @ManyToOne(() => Categories, (cat) => cat.products)
  category: Categories;

  @OneToMany(() => Wishlists, (wishlist) => wishlist.product)
  wishlists: Wishlists[];

  @OneToMany(() => ProductReviews, (productReview) => productReview.product)
  productReviews: ProductReviews[];

  @OneToMany(() => SaleDetails, (saleDetail) => saleDetail.product)
  saleDetails: SaleDetails[];

  @OneToMany(() => PurchaseOrderDetails, (pod) => pod.product)
  purchaseOrderDetails: PurchaseOrderDetails[];

  @OneToMany(() => StockReceptionDetails, (srd) => srd.product)
  stockReceptionDetails: StockReceptionDetails[];
}
