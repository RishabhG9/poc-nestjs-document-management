import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFilenameDto {
  @ApiProperty({ example: 'NewDocumentName.pdf' })
  @IsString()
  filename!: string;
}
