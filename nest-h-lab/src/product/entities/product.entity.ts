// src/product/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductDictionary } from './product-dictionary.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ProductDictionary, (dictionary) => dictionary.product, {
    cascade: true,
  })
  dictionary: ProductDictionary[];
}
