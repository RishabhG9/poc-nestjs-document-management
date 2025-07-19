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
import { RolesGuard } from 'src/common/guards/roles.guard';

import { Express } from 'express';
import * as toStream from 'buffer-to-stream';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const user = req.user as User;

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
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
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
            uuid: 'doc-1234-uuid',
            filename: 'report.pdf',
            mimetype: 'application/pdf',
            url: 'https://res.cloudinary.com/your-cloud-name/.../report.pdf',
            archived: null,
            created_at: '2025-07-19T12:34:56.789Z',
            updated_at: '2025-07-19T12:34:56.789Z',
            uploader: {
              id: 1,
              uuid: 'user-uuid-5678',
              email: 'editor@example.com',
              first_name: 'Jane',
              last_name: 'Doe',
              role: 'editor',
              phone: 9876543210,
              created_at: '2025-06-01T08:00:00.000Z',
              updated_at: '2025-07-01T09:30:00.000Z',
            }
          }
        ],
        total: 1
      }
    }
  })
  async listAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    return this.documentService.findAll(page, limit, search);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  @ApiResponse({ status: 403, description: 'Only uploader or admin can delete' })
  async delete(@Param('id') id: number) {

    const document = await this.documentService.findOne(id);
    if (!document) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);

    await this.documentService.delete(id);
    return { message: 'Deleted successfully' };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  @ApiOperation({ summary: 'Update document filename' })
  @ApiResponse({ status: 200, description: 'Updated successfully' })
  @ApiResponse({ status: 403, description: 'Only uploader or admin can update' })
  async updateName(@Param('id') id: number, @Body('filename') filename: string) {

    const document = await this.documentService.findOne(id);

    if (!document) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);

    return this.documentService.updateFilename(id, filename);
  }
}