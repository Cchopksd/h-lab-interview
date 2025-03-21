import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

interface ProductResponse {
  status: number;
  message: string;
  data: {
    id: string;
    createdAt: string;
    dictionaries: {
      languageCode: string;
      name: string;
      description: string;
    }[];
  };
}

interface Product {
  id: number;
  name: string;
  description: string;
  product: {
    id: number;
    createdAt: string;
  };
  language: {
    code: string;
    name: string;
  };
}

interface Pagination {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

interface GetProductResponse {
  statusCode: number;
  message: string;
  pagination: Pagination;
  data: Product[][];
}

interface ProductResponseError {
  message: string | string[];
  error: string;
  statusCode: number;
}

describe('ProductController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/product (POST) - should create product with translations', async () => {
    const payload = {
      name: 'กระดาษ A4',
      description: 'กระตาษคุณภาพดี',
      language: ['en', 'ch'],
    };

    const response = await request(app.getHttpServer())
      .post('/product')
      .send(payload)
      .expect(201);

    const body: ProductResponse = response.body as ProductResponse;

    expect(response.body).toHaveProperty('statusCode', 200);
    expect(body.message).toBe(
      'Product created successfully with translations.',
    );
    expect(body.data.id).toBeDefined();
    expect(body.data.dictionaries.length).toBeGreaterThan(0);

    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('createdAt');
    expect(Array.isArray(body.data.dictionaries)).toBe(true);
    expect(body.data.dictionaries.length).toBeGreaterThanOrEqual(2);

    const enTranslation = body.data.dictionaries.find(
      (d) => d.languageCode === 'en',
    );

    expect(enTranslation).toEqual(
      expect.objectContaining({
        languageCode: 'en',
        name: expect.any(String) as string,
        description: expect.any(String) as string,
      }),
    );

    const chTranslation = body.data.dictionaries.find(
      (d) => d.languageCode === 'ch',
    );

    expect(chTranslation).toEqual(
      expect.objectContaining({
        languageCode: 'ch',
        name: expect.any(String) as string,
        description: expect.any(String) as string,
      }),
    );

    const thTranslation = body.data.dictionaries.find(
      (d) => d.languageCode === 'th',
    );
    expect(thTranslation).toMatchObject({
      languageCode: 'th',
      name: 'กระดาษ A4',
      description: 'กระตาษคุณภาพดี',
    });
  });

  it('/product (POST) - should return 400 for missing required fields', async () => {
    const payload = {};

    const response = await request(app.getHttpServer())
      .post('/product')
      .send(payload);

    // Assert the status code is 400 for a Bad Request
    expect(response.statusCode).toBe(400);
    // Assert that the response contains a statusCode of 400
    expect(response.body).toHaveProperty('statusCode', 400);
    // Assert that the response contains the error message "Bad Request"
    expect(response.body).toHaveProperty('error', 'Bad Request');

    // Cast the response body to ProductResponseError for further checks
    const body: ProductResponseError = response.body as ProductResponseError;

    expect(body.message).toEqual([
      'name should not be empty',
      'name must be a string',
      'description should not be empty',
      'description must be a string',
      'language should not be empty',
      'language must be an array',
    ]);
  });

  it('/product (POST) - should return 400 for missing description and language fields', async () => {
    const payload = { name: 'กระดาษ A4' };

    const response = await request(app.getHttpServer())
      .post('/product')
      .send(payload);

    // Assert the status code is 400 for a Bad Request
    expect(response.statusCode).toBe(400);
    // Assert that the response contains a statusCode of 400
    expect(response.body).toHaveProperty('statusCode', 400);
    // Assert that the response contains the error message "Bad Request"
    expect(response.body).toHaveProperty('error', 'Bad Request');

    // Cast the response body to ProductResponseError for further checks
    const body: ProductResponseError = response.body as ProductResponseError;

    expect(body.message).toEqual([
      'description should not be empty',
      'description must be a string',
      'language should not be empty',
      'language must be an array',
    ]);
  });

  it('/product (POST) - should return 400 for missing language fields', async () => {
    const payload = { name: 'กระดาษ A4', description: 'กระตาษคุณภาพดี' };

    const response = await request(app.getHttpServer())
      .post('/product')
      .send(payload);

    // Assert the status code is 400 for a Bad Request
    expect(response.statusCode).toBe(400);
    // Assert that the response contains a statusCode of 400
    expect(response.body).toHaveProperty('statusCode', 400);
    // Assert that the response contains the error message "Bad Request"
    expect(response.body).toHaveProperty('error', 'Bad Request');

    // Cast the response body to ProductResponseError for further checks
    const body: ProductResponseError = response.body as ProductResponseError;

    expect(body.message).toEqual([
      'language should not be empty',
      'language must be an array',
    ]);
  });

  it('/product (POST) - should return 400 for missing language is not support', async () => {
    const payload = {
      name: 'กระดาษ A4',
      description: 'กระตาษคุณภาพดี',
      language: ['fr'],
    };

    const response = await request(app.getHttpServer())
      .post('/product')
      .send(payload);

    // Assert the status code is 400 for a Bad Request
    expect(response.statusCode).toBe(400);
    // Assert that the response contains a statusCode of 400
    expect(response.body).toHaveProperty('statusCode', 400);
    // Assert that the response contains the error message "Bad Request"
    expect(response.body).toHaveProperty('error', 'Bad Request');

    // Cast the response body to ProductResponseError for further checks
    const body: ProductResponseError = response.body as ProductResponseError;

    expect(body.message).toEqual(`Language fr not found`);
  });

  it('/product (GET) - should return products with pagination', async () => {
    const getProductDto = {
      product_name: 'กระดาษ A4',
      page: '1',
    };

    const response = await request(app.getHttpServer())
      .get('/product')
      .query(getProductDto)
      .expect(200);

    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body).toHaveProperty(
      'message',
      'Products fetched successfully with translations.',
    );

    const body: GetProductResponse = response.body as GetProductResponse;

    expect(body).toHaveProperty('pagination');
    expect(body.pagination.totalItems).toEqual(expect.any(Number));
    expect(body.pagination.currentPage).toEqual(expect.any(Number));
    expect(body.pagination.totalPages).toEqual(expect.any(Number));

    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);

    body.data.forEach((productTranslations) => {
      expect(Array.isArray(productTranslations)).toBe(true);

      productTranslations.forEach((translation) => {
        expect(typeof translation.name).toBe('string');
        expect(typeof translation.description).toBe('string');

        expect(translation).toHaveProperty('product');
        expect(typeof translation.product.id).toBe('number');
        expect(typeof translation.product.createdAt).toBe('string');

        expect(translation).toHaveProperty('language');
        expect(typeof translation.language.code).toBe('string');
        expect(typeof translation.language.name).toBe('string');
      });
    });
  });
});
