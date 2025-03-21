import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Field {
  name = 'name',
  description = 'description',
}

export class TranslateTextDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  sourceLang: string;

  @Transform(({ value }: { value: string }) => {
    return value === 'en' ? 'english' : value === 'ch' ? 'chinese' : value;
  })
  @IsNotEmpty()
  @IsString()
  targetLang: string;

  field: Field;
}
