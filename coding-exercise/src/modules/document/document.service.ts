import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Like, Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) { }

  async save(fileData: Partial<Document>): Promise<Document> {
    const doc = this.documentRepository.create(fileData);
    return this.documentRepository.save(doc);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    uploadedBy?: number,
  ): Promise<{ data: Document[]; total: number }> {

    const where: any = { archived: IsNull()};

    if (search) {
      where.filename = ILike(`%${search}%`);
    }

    if (uploadedBy) {
      where.uploadedBy = { id: uploadedBy };
    }

    console.log("WHERE", where)
    const [data, total] = await this.documentRepository.findAndCount({
      where,
      relations: ['uploadedBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: number): Promise<Document | null> {
    return this.documentRepository.findOne({ where: { id }, relations: ['uploadedBy'] });
  }

  async delete(id: number, document: Document) {

    // Optionally, check if already archived
    if (document.archived) {
      throw new BadRequestException('Document already Deleted');
    }

    return this.documentRepository.update(id, {
      archived: new Date(),
    });
  }

  async updateFilename(id: number, filename: string): Promise<Document | null> {
    const doc = await this.findOne(id);
    if (!doc) return null;
    doc.filename = filename;
    return this.documentRepository.save(doc);
  }
}