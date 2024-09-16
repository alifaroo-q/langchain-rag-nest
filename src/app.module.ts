import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSQLConfig } from './config/database/orm.config';
import { AuthModule } from './module/core/auth/auth.module';

@Module({
  imports: [CustomConfigModule, TypeOrmModule.forRootAsync(PostgreSQLConfig), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
