import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  // Pre-computed hash of a random string — used as dummy when user not found to
  // prevent email enumeration via response timing (bcrypt always takes ~100ms).
  private static readonly DUMMY_HASH =
    '$2b$10$X4kv7j5ZcG3nOBn316eM3OJwX7woYHBpKmKFcA8g0FqJNqxBMd9eS';

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const hash = user?.password ?? AuthService.DUMMY_HASH;
    const ok = await bcrypt.compare(password, hash).catch(() => false);
    if (!user || !ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { ok: true };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('No account with this email address exists');

    // Invalidate any existing tokens for this user.
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const adminBase = process.env.ADMIN_BASE_URL ?? 'https://admin-jetsonic.up.railway.app';
    const resetUrl = `${adminBase}/reset-password?token=${rawToken}`;
    await this.email.sendPasswordReset(user.email, user.name, resetUrl);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.expiresAt < new Date()) {
      // Delete expired token if it exists.
      if (record) await this.prisma.passwordResetToken.delete({ where: { tokenHash } });
      throw new BadRequestException('Reset link is invalid or has expired');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      this.prisma.passwordResetToken.delete({ where: { tokenHash } }),
    ]);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
