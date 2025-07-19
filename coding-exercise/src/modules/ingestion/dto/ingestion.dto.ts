import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { IngestionStatus } from '../ingestion.entity';

export class TriggerIngestionDto {
  @ApiProperty({
    example: 1,
    description: 'Document ID to process for ingestion'
  })
  @IsNumber()
  documentId!: number;
}

export class IngestionStatusDto {
  @ApiProperty({
    enum: IngestionStatus,
    example: IngestionStatus.PROCESSING,
    description: 'New status of the ingestion process'
  })
  @IsEnum(IngestionStatus)
  status!: IngestionStatus;

  @ApiProperty({
    example: 75,
    description: 'Progress percentage (0-100)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  progress?: number;

  @ApiProperty({
    example: 'Processing embeddings...',
    description: 'Error message if status is failed',
    required: false
  })
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({
    example: 150,
    description: 'Number of embeddings generated',
    required: false
  })
  @IsOptional()
  @IsNumber()
  embeddingsGenerated?: number;
}