import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { Products } from "./product.entity.js";
import { Users } from "./user.entity.js";
import { SaleDetails } from "./saleDetail.entity.js";
import { PurchaseOrderDetails } from "./purchaseOrderDetail.entity.js";
import { StockReceptionDetails } from "./stockReceptionDetail.entity.js";

@Entity('units')
@Unique(['name', 'createdBy'])
export class Units {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weightInGrams?: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: Users;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Products, (product) => product.unit)
  products: Products[];

  @OneToMany(() => SaleDetails, (sd) => sd.unit)
  saleDetails: SaleDetails[];

  @OneToMany(() => PurchaseOrderDetails, (pod) => pod.unit)
  purchaseOrderDetails: PurchaseOrderDetails[];

  @OneToMany(() => StockReceptionDetails, (srd) => srd.unit)
  stockReceptionDetails: StockReceptionDetails[];
}
