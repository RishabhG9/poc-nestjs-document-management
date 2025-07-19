import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Delete,
  Param,
  Patch,
  Body,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { User, UserRole } from '../users/users.entity';
import { DocumentService } from './document.service';

import { Express } from 'express';
import * as toStream from 'buffer-to-stream';
import { v2 as cloudinaryV2 } from 'cloudinary';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
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
  @ApiResponse({ status: 403, description: 'Viewer role is not allowed to upload' })
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const user = req.user as User;

    if (user.role === UserRole.VIEWER) {
      throw new HttpException('Viewer role is not allowed to upload', HttpStatus.FORBIDDEN);
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        { resource_type: 'auto' },
        async (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));

          const saved = await this.documentService.save({
            filename: file.originalname,
            mimetype: file.mimetype,
            url: result.secure_url,
            uploader: user,
          });
          resolve(saved);
        },
      );
      toStream(file.buffer).pipe(uploadStream);
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all documents with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({
    description: 'Paginated list of documents',
    schema: {
      example: {
        data: [
          {
            id: 1,
            filename: 'file1.pdf',
            mimetype: 'application/pdf',
            url: 'https://res.cloudinary.com/demo/...',
            uploader: {
              id: 1,
              email: 'user@example.com',
              role: 'admin',
            },
            createdAt: '2025-07-19T12:34:56.789Z',
          },
        ],
        total: 1,
      },
    },
  })
  async listAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    return this.documentService.findAll(page, limit, search);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only uploader or admin can delete' })
  async delete(@Param('id') id: number, @Req() req) {
    const user = req.user as User;
    const document = await this.documentService.findOne(id);
    if (!document) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);

    if (user.role !== 'admin' && document.uploader.id !== user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    await this.documentService.delete(id);
    return { message: 'Deleted successfully' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document filename' })
  @ApiResponse({ status: 200, description: 'Updated successfully' })
  @ApiResponse({ status: 403, description: 'Only uploader or admin can update' })
  async updateName(@Param('id') id: number, @Body('filename') filename: string, @Req() req) {
    const user = req.user as User;
    const document = await this.documentService.findOne(id);

    if (!document) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);

    if (user.role !== 'admin' && document.uploader.id !== user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return this.documentService.updateFilename(id, filename);
  }
}