// src/product/entities/language.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('languages')
export class Language {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;
}
