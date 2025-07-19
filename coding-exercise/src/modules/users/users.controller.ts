import { AuthGuard } from '@nestjs/passport';
import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { UserRole } from './users.entity';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  findOne(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id') id: number, @Body('role') role: UserRole) {
    return this.userService.updateRole(id, role);
  }
}