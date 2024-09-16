import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { CustomConfigModule } from 'src/config/config.module';

@Module({
  imports: [CustomConfigModule],
  providers: [EmbeddingsService],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
