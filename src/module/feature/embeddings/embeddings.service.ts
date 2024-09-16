import { Injectable } from '@nestjs/common';
import {
  DistanceStrategy,
  PGVectorStore,
  PGVectorStoreArgs,
} from '@langchain/community/vectorstores/pgvector';
import { ConfigService } from '@nestjs/config';
import { PoolConfig } from 'pg';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

@Injectable()
export class EmbeddingsService {
  constructor(private readonly configService: ConfigService) {}

  async createEmbeddings(file: Express.Multer.File) {
    const user = this.configService.get('postgres.user');
    const password = this.configService.get('postgres.password');
    const host = this.configService.get('postgres.host');
    const port = this.configService.get('postgres.port');
    const database = this.configService.get('postgres.database');

    const openAI_Api_Key = this.configService.get('app.openAIApiKey');

    const embeddings = new OpenAIEmbeddings({ openAIApiKey: openAI_Api_Key });

    const config = {
      postgresConnectionOptions: {
        type: 'postgres',
        host,
        port,
        user,
        password,
        database,
      } as PoolConfig,
      tableName: 'LangchainEmbeddings',
      collectionName: file.filename,
      collectionTableName: 'LangchainCollections',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'vector',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
      distanceStrategy: 'cosine' as DistanceStrategy,
    } as PGVectorStoreArgs;

    const vectorStore = await PGVectorStore.initialize(embeddings, config);

    const loader = new PDFLoader(file.path);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      separators: ['\n\n', '\n', ' ', ''],
    });
    const splits = await splitter.splitDocuments(docs);

    await vectorStore.addDocuments(splits);
  }
}
