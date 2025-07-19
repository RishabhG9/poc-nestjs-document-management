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
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: 201, description: 'Ingestion process started' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async triggerIngestion(@Body() triggerDto: TriggerIngestionDto, @Req() req) {
    const userId = req.user.userId;
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
  @ApiResponse({ status: 200, description: 'Ingestion process details' })
  @ApiResponse({ status: 404, description: 'Ingestion not found' })
  async getIngestion(@Param('id') id: number) {
    return this.ingestionService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update ingestion process status (Admin only)' })
  @ApiBody({ type: IngestionStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Ingestion not found' })
  async updateStatus(@Param('id') id: number, @Body() updateDto: IngestionStatusDto) {
    return this.ingestionService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel ingestion process (Admin only)' })
  @ApiResponse({ status: 200, description: 'Ingestion cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Ingestion not found' })
  async cancelIngestion(@Param('id') id: number) {
    return this.ingestionService.cancelIngestion(id);
  }
}