import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Sale } from "./sale.entity.js";

@Entity('payments')
export class Payments {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    saleId: string;

    @Column({ type: 'varchar', length: 50 })
    paymentMethod: string; // 'cash', 'transfer', etc.

    @Column({ type: 'varchar', length: 10, default: 'KIP' })
    currency: string; // 'KIP', 'THB', 'USD'

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'text', nullable: true })
    slipImageUrl?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    paidAt: Date;

    // Relations
    @ManyToOne(() => Sale, (sale) => sale.payments)
    sale: Sale;
}
