import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

import {
  DistanceStrategy,
  PGVectorStore,
  PGVectorStoreArgs,
} from '@langchain/community/vectorstores/pgvector';
import { Pool, PoolConfig } from 'pg';

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

import { QueryDto } from '../chat/dto/query.dto';
import { TEMPLATES } from 'src/constant/prompt.constant';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';

@Injectable()
export class EmbeddingsService {
  private postgresConnection = {} as PoolConfig;
  private embeddings = null as OpenAIEmbeddings;

  constructor(private readonly configService: ConfigService) {
    this.postgresConnection = {
      type: 'postgres',
      host: this.configService.get('postgres.host'),
      port: this.configService.get('postgres.port'),
      user: this.configService.get('postgres.user'),
      password: this.configService.get('postgres.password'),
      database: this.configService.get('postgres.database'),
    } as PoolConfig;

    this.embeddings = new OpenAIEmbeddings({
      apiKey: this.configService.get<string>('app.openAIApiKey'),
      model: 'text-embedding-3-small',
    });
  }

  async createEmbeddings(file: Express.Multer.File) {
    const config = {
      postgresConnectionOptions: this.postgresConnection,
      tableName: 'LangchainEmbeddings',
      collectionTableName: 'LangchainCollections',
      collectionName: file.filename,
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'document',
        metadataColumnName: 'cmetadata',
      },
      distanceStrategy: 'cosine' as DistanceStrategy,
    } as PGVectorStoreArgs;

    const loader = new PDFLoader(file.path);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      separators: ['\n\n', '\n'],
    });

    const splits = await splitter.splitDocuments(docs);

    await PGVectorStore.fromDocuments(splits, this.embeddings, config);
  }

  async getEmbeddingCollections() {
    const vectorStore = new Pool(this.postgresConnection);
    const collections = await vectorStore.query(
      'SELECT uuid, name FROM langchaincollections',
    );

    return collections.rows;
  }

  async ragQuery(query: QueryDto) {
    const chatModel = new ChatOpenAI({
      apiKey: this.configService.get<string>('app.openAIApiKey'),
      model: 'gpt-3.5-turbo',
    });

    const vectorStore = new PGVectorStore(this.embeddings, {
      postgresConnectionOptions: this.postgresConnection,
      tableName: 'LangchainEmbeddings',
      collectionTableName: 'LangchainCollections',
      collectionName: query.collectionName,
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'document',
        metadataColumnName: 'cmetadata',
      },
      distanceStrategy: 'cosine' as DistanceStrategy,
    });

    console.log(await vectorStore.similaritySearch('Additional notes'));

    const retriever = vectorStore.asRetriever();

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', TEMPLATES.SYSTEM_TEMPLATE],
      new MessagesPlaceholder('messages'),
    ]);

    // const combineDocsChain = await createStuffDocumentsChain({
    //   llm: chatModel,
    //   prompt: prompt,
    // });

    // const parseRetrieverInput = (params: { messages: BaseMessage[] }) => {
    //   return params.messages[params.messages.length - 1].content;
    // };

    // const retrievalChain = RunnablePassthrough.assign({
    //   context: RunnableSequence.from([parseRetrieverInput, retriever]),
    // }).assign({
    //   answer: combineDocsChain,
    // });

    // const result = await retrievalChain.invoke({
    //   messages: [new HumanMessage(query.query)],
    // });

    // console.log(result);

    // return result['answer'];
  }
}
