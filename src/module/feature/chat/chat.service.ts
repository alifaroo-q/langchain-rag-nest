import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';

@Injectable()
export class ChatService {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  uploadFileAndCreateEmbeddings(file: Express.Multer.File) {
    return this.embeddingsService.createEmbeddings(file);
  }
}
