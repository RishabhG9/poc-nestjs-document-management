import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    uploaderId?: number,
  ): Promise<{ data: Document[]; total: number }> {
    const where: any = {};
    if (search) where.filename = Like(`%${search}%`);
    if (uploaderId) where.uploader = { id: uploaderId };

    const [data, total] = await this.documentRepo.findAndCount({
      where,
      relations: ['uploader'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: number): Promise<Document | null> {
    return this.documentRepo.findOne({ where: { id }, relations: ['uploader'] });
  }

  async delete(id: number) {
    return this.documentRepo.delete(id);
  }

  async updateFilename(id: number, filename: string): Promise<Document | null> {
    const doc = await this.findOne(id);
    if (!doc) return null;
    doc.filename = filename;
    return this.documentRepo.save(doc);
  }
}