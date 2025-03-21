import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';
import { GetProductDto } from './dto/get-product.dto';
import { InternalServerErrorException, HttpException } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;

  const mockProductService = {
    create: jest.fn(),
    getProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should return result from service', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        language: ['en'],
      };

      const mockResponse = { statusCode: 200, message: 'Created' };
      mockProductService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto);
      expect(result).toEqual(mockResponse);
      expect(mockProductService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw HttpException from service', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        language: ['en'],
      };

      mockProductService.create.mockRejectedValue(
        new HttpException('Bad Request', 400),
      );

      await expect(controller.create(dto)).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        language: ['en'],
      };

      mockProductService.create.mockRejectedValue(
        new Error('Unexpected server error'),
      );

      await expect(controller.create(dto)).rejects.toThrowError(
        new InternalServerErrorException('Unexpected server error'),
      );
    });
  });

  describe('get()', () => {
    it('should return product data from service', async () => {
      const dto: GetProductDto = { product_name: 'Test Product' };
      const mockResult = { statusCode: 200, data: [] };

      mockProductService.getProduct.mockResolvedValue(mockResult);

      const result = await controller.get(dto);
      expect(result).toEqual(mockResult);
      expect(mockProductService.getProduct).toHaveBeenCalledWith(dto);
    });

    it('should throw HttpException from service in get()', async () => {
      const dto: GetProductDto = { product_name: 'Test Product' };

      mockProductService.getProduct.mockRejectedValue(
        new HttpException('Not Found', 404),
      );

      await expect(controller.get(dto)).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException on unexpected error in get()', async () => {
      const dto: GetProductDto = { product_name: 'Test Product' };

      mockProductService.getProduct.mockRejectedValue(
        new Error('Unexpected server error'),
      );

      await expect(controller.get(dto)).rejects.toThrow(
        'Unexpected server error',
      );
    });
  });
});
