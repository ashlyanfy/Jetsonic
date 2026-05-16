import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: Role;
}

interface UpdateUserInput {
  name?: string;
  role?: Role;
  password?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async setLanguage(userId: string, language: string) {
    const lang = language === 'ru' ? 'ru' : 'en';
    return this.prisma.user.update({
      where: { id: userId },
      data: { language: lang },
      select: { id: true, language: true },
    });
  }

  async create(data: CreateUserInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('User with this email already exists');
    if (!data.password || data.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { email: data.email, name: data.name, role: data.role, password: hashed },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    return user;
  }

  async update(id: string, data: UpdateUserInput) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.role !== undefined) payload.role = data.role;
    if (data.password !== undefined) {
      if (data.password.length < 8) throw new BadRequestException('Password must be at least 8 characters');
      payload.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: payload,
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async remove(id: string, requestingUserId: string) {
    if (id === requestingUserId) throw new BadRequestException('You cannot delete your own account');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }
}
