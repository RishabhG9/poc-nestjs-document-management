import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { IngestionService } from './ingestion.service';
import { TriggerIngestionDto, IngestionStatusDto } from './dto/ingestion.dto';
import { IngestionStatus } from './ingestion.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/users.entity';

@ApiTags('Ingestion')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) { }

  @Post('trigger')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Trigger document ingestion process' })
  @ApiBody({ type: TriggerIngestionDto })
  @ApiOkResponse({
    description: 'Ingestion process started',
    schema: {
      example: {
        id: 1,
        uuid: "989a8467-bfe3-4772-8159-c8d82f2bbfa8",
        createdAt: "2025-07-21T11:46:35.875Z",
        updatedAt: "2025-07-21T11:46:35.875Z",
        archived: null,
        status: "pending",
        progress: 0,
        errorMessage: null,
        embeddingsGenerated: null,
        document: {
          id: 4,
          uuid: "6866f3b3-cc14-48e7-99c1-37bfdf514f7c",
          createdAt: "2025-07-20T02:05:14.217Z",
          updatedAt: "2025-07-20T07:40:12.144Z",
          archived: null,
          filename: "R_Frontend_Resume.pdf",
          mimetype: "application/pdf",
          url: "https://res.cloudinary.com/dfptmfjys/image/upload/v1752996913/cnfehi7ekfo5n14pn6hz.pdf",
          uploadedBy: null
        },
        triggeredBy: {
          id: 3
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Document not found',
    schema: {
      example: {
        message: "Document not found",
        error: "Not Found",
        statusCode: 404
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
  async triggerIngestion(@Body() triggerDto: TriggerIngestionDto, @Req() req) {
    const userId = req.user.sub;
    return this.ingestionService.triggerIngestion(triggerDto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'List all ingestion processes with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', enum: IngestionStatus, required: false })
  @ApiOkResponse({
    description: 'Paginated list of ingestion processes',
    schema: {
      example: {
        data: [
          {
            id: 1,
            uuid: 'ingestion-uuid-1234',
            status: 'completed',
            progress: 100,
            embeddingsGenerated: 125,
            errorMessage: null,
            created_at: '2025-01-19T12:34:56.789Z',
            updated_at: '2025-01-19T12:36:56.789Z',
            document: {
              id: 1,
              filename: 'report.pdf',
              url: 'https://cloudinary.com/...'
            },
            triggeredBy: {
              id: 1,
              email: 'admin@example.com',
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        ],
        total: 1
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
  async listIngestions(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: IngestionStatus,
  ) {
    return this.ingestionService.findAll(page, limit, status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get ingestion process by ID' })
  @ApiOkResponse({
    description: "Ingestion process details",
    schema: {
      example: {
        id: 1,
        uuid: 'ingestion-uuid-1234',
        status: 'completed',
        progress: 100,
        embeddingsGenerated: 125,
        errorMessage: null,
        created_at: '2025-01-19T12:34:56.789Z',
        updated_at: '2025-01-19T12:36:56.789Z',
        document: {
          id: 1,
          filename: 'report.pdf',
          url: 'https://cloudinary.com/...'
        },
        triggeredBy: {
          id: 1,
          email: 'admin@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Ingestion not found',
    schema: {
      example: {
        message: "Ingestion data not found",
        error: "Not Found",
        statusCode: 404
      }
    }
  })
  async getIngestion(@Param('id') id: number) {
    return this.ingestionService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update ingestion process status (Admin only)' })
  @ApiBody({ type: IngestionStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiNotFoundResponse({
    description: 'Ingestion not found',
    schema: {
      example: {
        message: "Ingestion data not found",
        error: "Not Found",
        statusCode: 404
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
  async updateStatus(@Param('id') id: number, @Body() updateDto: IngestionStatusDto) {
    return this.ingestionService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel ingestion process (Admin only)' })
  @ApiResponse({ status: 200, description: 'Ingestion cancelled successfully' })
  @ApiNotFoundResponse({
    description: 'Ingestion not found',
    schema: {
      example: {
        message: "Ingestion data not found",
        error: "Not Found",
        statusCode: 404
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
  async cancelIngestion(@Param('id') id: number) {
    return this.ingestionService.cancelIngestion(id);
  }
}