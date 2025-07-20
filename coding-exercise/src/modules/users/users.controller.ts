import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Param, Patch, Body, UseGuards, Query } from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { UserRole } from './users.entity';
import { UserService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UpdateUserDto, UserResponseDto } from './dto/user-response-dto';

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Get all the users with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({
    description: 'Paginated list of users',
    schema: {
      example: {
        data: [
          {
            id: 1,
            uuid: 'a12b34c5',
            role: 'admin',
            email: 'admin@example.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: "1234567890",
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
          },
        ],
        total: 1,
      },
    },
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
  findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    return this.userService.findAll(page, limit, search);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({
    description: 'Single user data',
    type: UserResponseDto,
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
  findOne(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({
    description: 'Updated user data',
    type: UserResponseDto,
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
  @ApiBody({ type: UpdateUserDto })
  updateUserDetail(@Param('id') id: number, @Body() updateDto: UpdateUserDto) {
    return this.userService.updateUserDetail(id, updateDto);
  }
}