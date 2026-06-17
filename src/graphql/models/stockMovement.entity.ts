import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Products } from "./product.entity.js";
import { Users } from "./user.entity.js";

/// One audit entry per stock change. Covers sales (negative), purchase
/// receptions (positive), and manual product edits (either sign).
@Entity('stock_movements')
export class StockMovements {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  // Shop owner whose stock changed (so we can scope history per shop).
  @Column('uuid')
  userId: string;

  // Signed delta. Negative = stock decreased, positive = increased.
  @Column({ type: 'int' })
  change: number;

  @Column({ type: 'int' })
  quantityBefore: number;

  @Column({ type: 'int' })
  quantityAfter: number;

  // Free-text label, e.g. 'sale', 'reception', 'manual_edit'.
  @Column({ type: 'varchar', length: 32 })
  reason: string;

  // Sale id / reception id / null. Helps trace back to the source record.
  @Column({ type: 'uuid', nullable: true })
  referenceId?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  referenceType?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @ManyToOne(() => Products)
  @JoinColumn({ name: 'productId' })
  product: Products;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
