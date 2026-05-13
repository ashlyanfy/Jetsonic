import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';

interface CreateUserBody {
  email: string;
  name: string;
  password: string;
  role: Role;
}

interface UpdateUserBody {
  name?: string;
  role?: Role;
  password?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  create(@Body() body: CreateUserBody) {
    return this.users.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserBody) {
    return this.users.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() current: AuthUser) {
    return this.users.remove(id, current.id);
  }
}
