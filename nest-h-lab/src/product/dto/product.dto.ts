import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name (in default language)',
    example: 'หูฟังไร้สาย',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description (in default language)',
    example: 'หูฟังไร้สายคุณภาพสูงพร้อมระบบตัดเสียงรบกวน',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'List of language codes to translate into (default language included)',
    example: ['en', 'ch'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  language: string[];
}
