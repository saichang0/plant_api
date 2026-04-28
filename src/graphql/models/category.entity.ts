import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Products } from "./product.entity.js";
import { Users } from "./user.entity.js";

@Entity('categories')
export class Categories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: Users;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Products, (product) => product.category)
  products: Products[];
}
