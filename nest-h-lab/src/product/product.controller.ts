import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';
import { GetProductDto } from './dto/get-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully with translations.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiBody({ type: CreateProductDto })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get products based on query parameters' })
  @ApiResponse({
    status: 200,
    description: 'Products fetched successfully with translations.',
  })
  async get(@Query() getProductDto: GetProductDto) {
    return this.productService.getProduct(getProductDto);
  }
}
