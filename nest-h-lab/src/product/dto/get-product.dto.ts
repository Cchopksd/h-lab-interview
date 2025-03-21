import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductDto {
  @ApiPropertyOptional({
    description:
      'Filter by product name (case-insensitive, partial match allowed)',
    example: 'หูฟังไร้สาย',
  })
  @IsString()
  @IsOptional()
  product_name?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination (must be positive)',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page?: number;
}
