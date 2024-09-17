import { IsNotEmpty, IsString } from 'class-validator';

export class QueryDto {
  @IsNotEmpty()
  @IsString()
  collectionName: string;

  @IsNotEmpty()
  @IsString()
  query: string;
}
