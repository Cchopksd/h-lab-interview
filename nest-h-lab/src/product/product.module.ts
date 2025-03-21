// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductDictionary } from './entities/product-dictionary.entity';
import { Language } from './entities/language.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TranslationModule } from '../translate/translation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductDictionary, Language]),
    TranslationModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
