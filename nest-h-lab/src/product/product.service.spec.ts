import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductDictionary } from './entities/product-dictionary.entity';
import { Language } from './entities/language.entity';
import { TranslationService } from '../translate/translation.service';
import { CreateProductDto } from './dto/product.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('ProductService - create()', () => {
  let service: ProductService;

  const mockProductRepository = {
    save: jest.fn(),
  };

  const mockProductDictionaryRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLanguageRepository = {
    findOne: jest.fn(),
  };

  const mockTranslationService = {
    translateText: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductDictionary),
          useValue: mockProductDictionaryRepository,
        },
        {
          provide: getRepositoryToken(Language),
          useValue: mockLanguageRepository,
        },
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product with translations successfully', async (): Promise<void> => {
    const dto: CreateProductDto = {
      name: 'สินค้า',
      description: 'รายละเอียด',
      language: ['en', 'ch'],
    };

    const savedProduct = { id: 1, createdAt: new Date() } as Product;
    const defaultLang = { code: 'th', name: 'Thai' } as Language;
    const enLang = { code: 'en', name: 'English' } as Language;
    const chLang = { code: 'ch', name: 'Chinese' } as Language;

    const defaultDict = {
      id: 1,
      name: dto.name,
      description: dto.description,
      language: defaultLang,
    } as ProductDictionary;

    const enDict = {
      id: 2,
      name: 'Product EN',
      description: 'Description EN',
      language: enLang,
    } as ProductDictionary;

    const chDict = {
      id: 3,
      name: 'Product CH',
      description: 'Description CH',
      language: chLang,
    } as ProductDictionary;

    mockProductRepository.save.mockResolvedValue(savedProduct);
    mockLanguageRepository.findOne.mockImplementation(({ where: { code } }) => {
      switch (code) {
        case 'th':
          return Promise.resolve(defaultLang);
        case 'en':
          return Promise.resolve(enLang);
        case 'ch':
          return Promise.resolve(chLang);
        default:
          return null;
      }
    });

    mockProductDictionaryRepository.create.mockReturnValue(defaultDict);
    mockProductDictionaryRepository.save
      .mockResolvedValueOnce(defaultDict)
      .mockResolvedValueOnce(enDict)
      .mockResolvedValueOnce(chDict);

    mockTranslationService.translateText
      .mockResolvedValueOnce('Product EN')
      .mockResolvedValueOnce('Description EN')
      .mockResolvedValueOnce('Product CH')
      .mockResolvedValueOnce('Description CH');

    const result = await service.create(dto);

    expect(mockProductRepository.save).toHaveBeenCalled();
    expect(mockLanguageRepository.findOne).toHaveBeenCalledTimes(3);
    expect(mockProductDictionaryRepository.save).toHaveBeenCalledTimes(3);
    expect(result.statusCode).toBe(200);
    expect(result.message).toBe(
      'Product created successfully with translations.',
    );
    expect(result.data.dictionaries.length).toBe(3);
  });

  it('should throw BadRequestException if a translation language is not found', async (): Promise<void> => {
    const dto: CreateProductDto = {
      name: 'สินค้า',
      description: 'รายละเอียด',
      language: ['jp'],
    };

    const savedProduct = { id: 1, createdAt: new Date() } as Product;
    const defaultLang = { code: 'th', name: 'Chinese' } as Language;
    const defaultDict = {
      name: dto.name,
      description: dto.description,
      language: defaultLang,
    } as ProductDictionary;

    mockProductRepository.save.mockResolvedValue(savedProduct);
    mockLanguageRepository.findOne.mockImplementation(({ where: { code } }) => {
      if (code === 'th') return Promise.resolve(defaultLang);
      if (code === 'jp') return null;
    });

    mockProductDictionaryRepository.create.mockReturnValue(defaultDict);
    mockProductDictionaryRepository.save.mockResolvedValueOnce(defaultDict);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const dto: CreateProductDto = {
      name: 'สินค้า',
      description: 'รายละเอียด',
      language: ['en'],
    };

    mockProductRepository.save.mockRejectedValue(
      new InternalServerErrorException(),
    );

    await expect(service.create(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
