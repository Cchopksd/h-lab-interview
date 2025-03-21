import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { Language } from './language.entity';

@Entity('product_dictionary')
@Unique(['product', 'language'])
export class ProductDictionary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @ManyToOne(() => Product, (product) => product.dictionary, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => Language, { eager: true })
  @JoinColumn({ name: 'languageCode' })
  language: Language;
}
