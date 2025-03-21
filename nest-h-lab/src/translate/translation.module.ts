import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';

@Module({
  controllers: [],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
