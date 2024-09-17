import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class ChatService {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  async uploadFileAndCreateEmbeddings(file: Express.Multer.File) {
    return this.embeddingsService.createEmbeddings(file);
  }

  async getAllEmbeddingCollections() {
    return this.embeddingsService.getEmbeddingCollections();
  }

  async ragQuery(query: QueryDto) {
    return this.embeddingsService.ragQuery(query);
  }
}
