import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

// Import Database Entities
import { Product } from './entities/product.entity';
import { ProductDictionary } from './entities/product-dictionary.entity';
import { Language } from './entities/language.entity';
import { CreateProductDto } from './dto/product.dto';
import { TranslationService } from '../translate/translation.service';
import { Field } from '../translate/dto/translate-text.dto';
import { GetProductDto } from './dto/get-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductDictionary)
    private productDictionaryRepository: Repository<ProductDictionary>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,

    private readonly translationService: TranslationService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = new Product();
    const savedProduct = await this.productRepository.save(product);

    const result: ProductDictionary[] = [];

    try {
      const defaultLanguage = await this.languageRepository.findOne({
        where: { code: 'th' },
      });
      if (!defaultLanguage) {
        throw new BadRequestException('Default language not found');
      }

      const defaultProductDictionary = this.productDictionaryRepository.create({
        name: createProductDto.name,
        description: createProductDto.description,
        product: savedProduct,
        language: defaultLanguage,
      });
      await this.productDictionaryRepository.save(defaultProductDictionary);
      result.push(defaultProductDictionary);

      const translationPromises = createProductDto.language.map(
        async (lang) => {
          if (lang === 'th') return;

          const language = await this.languageRepository.findOne({
            where: { code: lang },
          });
          if (!language) {
            throw new BadRequestException(`Language ${lang} not found`);
          }

          const [nameProductTranslatedData, descriptionProductTranslatedData] =
            await Promise.all([
              this.translationService.translateText({
                text: createProductDto.name,
                sourceLang: 'th',
                targetLang: lang,
                field: Field.name,
              }),
              this.translationService.translateText({
                text: createProductDto.description,
                sourceLang: 'th',
                targetLang: lang,
                field: Field.description,
              }),
            ]);

          const productDictionary = await this.productDictionaryRepository.save(
            {
              name: nameProductTranslatedData.replace('\n', ''),
              description: descriptionProductTranslatedData,
              product: savedProduct,
              language: language,
            },
          );

          result.push(productDictionary);
        },
      );

      await Promise.all(translationPromises);

      return {
        statusCode: HttpStatus.OK,
        message: 'Product created successfully with translations.',
        data: {
          id: savedProduct.id,
          createdAt: savedProduct.createdAt,

          dictionaries: result.map((dict) => ({
            languageCode: dict.language.code,
            name: dict.name,
            description: dict.description,
          })),
        },
      };
    } catch (err) {
      console.error(err);
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Network Interval Error');
    }
  }

  async getProduct(getProductDto: GetProductDto, limit = 10) {
    try {
      const page =
        getProductDto.page && getProductDto.page > 0 ? getProductDto.page : 1;

      const [products, total] =
        await this.productDictionaryRepository.findAndCount({
          where: { name: ILike(`%${getProductDto.product_name}%`) },
          relations: ['product', 'language'],
          skip: (page - 1) * limit,
          take: limit,
        });

      const relatedProducts = await Promise.all(
        products.map((product) =>
          this.productDictionaryRepository.find({
            where: { product: { id: product.product.id } },
            relations: ['product', 'language'],
          }),
        ),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Products fetched successfully with translations.',
        pagination: {
          totalItems: total,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
        },
        data: relatedProducts,
      };
    } catch (err) {
      console.error(err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException('Internal server error');
    }
  }
}
