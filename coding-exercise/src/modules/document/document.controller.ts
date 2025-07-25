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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { User, UserRole } from '../users/users.entity';
import { DocumentService } from './document.service';

import { Readable } from 'stream';
import { Express } from 'express';

import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import cloudinary from 'src/config/cloudinary.config';
import { UpdateFilenameDto } from './dto/update-fileName.dto';

const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

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
  @ApiOkResponse({
    description: 'File uploaded and saved to DB',
    schema: {
      example: {
        id: 8,
        uuid: "a5104f41-a950-42c6-8486-9ce224a4a330",
        createdAt: "2025-07-20T02:28:20.125Z",
        updatedAt: "2025-07-20T02:28:20.125Z",
        archived: null,
        filename: "Coding Exercise.pdf",
        mimetype: "application/pdf",
        url: "https://res.cloudinary.com/dfptmfjys/image/upload/v1752998299/ngdphwtxymmme4m8idep.pdf",
        uploadedBy: {
          id: 3
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Not authorized for to upload',
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401
      }
    }
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const user = req.user;
    const id = user.sub

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        async (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));

          const saved = await this.documentService.save({
            filename: file.originalname,
            mimetype: file.mimetype,
            url: result.secure_url,
            uploadedBy: { id } as User,
          });
          resolve(saved);
        },
      );
      bufferToStream(file.buffer).pipe(uploadStream);
    });
  }

  @Get()
  // @Roles(UserRole.ADMIN, UserRole.EDITOR)
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
            uploadedBy: {
              id: 1,
              uuid: 'user-uuid-5678',
              email: 'editor@example.com',
              first_name: 'Jane',
              last_name: 'Doe',
              role: 'editor',
              phone: "9876543210",
              created_at: '2025-06-01T08:00:00.000Z',
              updated_at: '2025-07-01T09:30:00.000Z',
            }
          }
        ],
        total: 1
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Not authorized for to upload',
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401
      }
    }
  })
  @ApiForbiddenResponse({
    description: 'Forbidden request',
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403
      }
    },
  })
  async listAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string, @Req() req?: any) {
    const user = req.user

    if (user.role === 'admin') {
      return this.documentService.findAll(page, limit, search);
    } else {
      const uploadedBy = Number(user?.sub)
      return this.documentService.findAll(page, limit, search, uploadedBy);
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Not authorized for to upload',
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401
      }
    }
  })
  @ApiForbiddenResponse({
    description: 'Forbidden request',
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403
      }
    },
  })
  async delete(@Param('id') id: number) {

    const document = await this.documentService.findOne(id);
    if (!document) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);

    await this.documentService.delete(id, document);
    return { message: 'Deleted successfully' };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.VIEWER)
  @ApiOperation({ summary: 'Update document filename' })
  @ApiOkResponse({
    description: 'Updated successfully',
    schema: {
      example: {
        id: 4,
        uuid: "6866f3b3-cc14-48e7-99c1-37bfdf514f7c",
        createdAt: "2025-07-20T02:05:14.217Z",
        updatedAt: "2025-07-20T07:40:12.144Z",
        archived: null,
        filename: "R_Frontend_Resume.pdf",
        mimetype: "application/pdf",
        url: "https://res.cloudinary.com/dfptmfjys/image/upload/v1752996913/cnfehi7ekfo5n14pn6hz.pdf",
        uploadedBy: {}
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Not authorized for to upload',
    schema: {
      example: {
        message: "Unauthorized",
        statusCode: 401
      }
    }
  })
  @ApiForbiddenResponse({
    description: 'Forbidden request',
    schema: {
      example: {
        message: "Forbidden resource",
        error: "Forbidden",
        statusCode: 403
      }
    },
  })
  async updateFileName(@Param('id') id: number, @Body() updatedBody: UpdateFilenameDto) {

    const document = await this.documentService.findOne(id);

    if (!document) throw new HttpException('Document not found', HttpStatus.NOT_FOUND);

    const { filename } = updatedBody;

    return this.documentService.updateFilename(id, filename);
  }
}