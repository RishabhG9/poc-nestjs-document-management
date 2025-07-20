import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { AuthModule } from './modules/auth/auth.module';
import { DocumentModule } from './modules/document/document.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { UserModule } from './modules/users/users.module';

import { Document } from './modules/document/document.entity';
import { Ingestion } from './modules/ingestion/ingestion.entity';
import { User } from './modules/users/users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Document, User, Ingestion],
      synchronize: true,
    }),
    AuthModule,
    DocumentModule,
    IngestionModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
