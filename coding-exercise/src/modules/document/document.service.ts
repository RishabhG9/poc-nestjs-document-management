import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
  ) { }

  async save(fileData: Partial<Document>): Promise<Document> {
    const doc = this.documentRepo.create(fileData);
    return this.documentRepo.save(doc);
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepo.find();
  }

  async delete(id: number) {
    return this.documentRepo.delete(id);
  }

  async updateFilename(id: number, filename: string): Promise<Document | null> {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) return null;
    doc.filename = filename;
    return this.documentRepo.save(doc);
  }
}