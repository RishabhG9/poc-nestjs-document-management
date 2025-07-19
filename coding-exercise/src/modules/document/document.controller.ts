import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  UseGuards,
  Delete,
  Patch,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DocumentService } from './document.service';

import { Express } from 'express';
import * as toStream from 'buffer-to-stream';
import { v2 as cloudinaryV2 } from 'cloudinary';
import cloudinary from '../../config/cloudinary.config';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded and saved to DB' })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        { resource_type: 'auto' },
        async (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));

          const saved = await this.documentService.save({
            filename: file.originalname,
            mimetype: file.mimetype,
            url: result.secure_url,
            uploadedBy: null, // Add auth integration later
          });
          resolve(saved);
        },
      );
      toStream(file.buffer).pipe(uploadStream);
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all documents' })
  async listAll() {
    return this.documentService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  async delete(@Param('id') id: number) {
    const deleted = await this.documentService.delete(id);
    if (!deleted.affected) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    return { message: 'Deleted successfully' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document filename' })
  async updateName(@Param('id') id: number, @Body('filename') filename: string) {
    const updated = await this.documentService.updateFilename(id, filename);
    if (!updated) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    return updated;
  }
}