import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Ingestion, IngestionStatus } from './ingestion.entity';
import { DocumentService } from '../document/document.service';
import { TriggerIngestionDto, IngestionStatusDto } from './dto/ingestion.dto';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(Ingestion)
    private readonly ingestionRepository: Repository<Ingestion>,
    private readonly documentService: DocumentService,
  ) { }

  async triggerIngestion(triggerDto: TriggerIngestionDto, userId: number): Promise<Ingestion> {
    const document = await this.documentService.findOne(triggerDto.documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Create ingestion record
    const ingestion = this.ingestionRepository.create({
      document,
      triggeredBy: { id: userId } as any,
      status: IngestionStatus.PENDING,
      progress: 0,
    });

    const saved = await this.ingestionRepository.save(ingestion);

    // Simulate async processing (in real app, this would call Python service)
    this.simulateIngestionProcess(saved.id);

    return saved;
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: IngestionStatus,
  ): Promise<{ data: Ingestion[]; total: number }> {
    const where: any = { archived: IsNull() };
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.ingestionRepository.findAndCount({
      where,
      relations: ['document', 'triggeredBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Ingestion | null> {
    const ingestionData = await this.ingestionRepository.findOne({
      where: { id },
      relations: ['document', 'triggeredBy']
    });

    if (!ingestionData) {
      throw new NotFoundException('Ingestion Data not found');
    } else {
      return ingestionData
    }
  }

  async updateStatus(id: number, updateDto: IngestionStatusDto): Promise<Ingestion> {
    const ingestion = await this.ingestionRepository.findOne({ where: { id } });
    if (!ingestion) {
      throw new NotFoundException('Ingestion not found');
    }

    Object.assign(ingestion, updateDto);
    return await this.ingestionRepository.save(ingestion);
  }

  async cancelIngestion(id: number): Promise<Ingestion> {
    return await this.updateStatus(id, {
      status: IngestionStatus.FAILED,
      errorMessage: 'Cancelled by user'
    });
  }

  // Simulate the ingestion process (replace with actual Python service call)
  private async simulateIngestionProcess(ingestionId: number) {
    const steps = [
      { progress: 25, status: IngestionStatus.PROCESSING, message: 'Extracting text...' },
      { progress: 50, status: IngestionStatus.PROCESSING, message: 'Generating embeddings...' },
      { progress: 75, status: IngestionStatus.PROCESSING, message: 'Storing embeddings...' },
      { progress: 100, status: IngestionStatus.COMPLETED, message: 'Completed successfully' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

      await this.updateStatus(ingestionId, {
        status: step.status,
        progress: step.progress,
        embeddingsGenerated: step.progress === 100 ? Math.floor(Math.random() * 200) + 50 : undefined,
      });
    }
  }
}