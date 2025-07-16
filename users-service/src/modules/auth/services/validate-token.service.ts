import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ValidateTokenRequest, ValidateTokenResponse } from 'src/shared/proto/users';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from 'generated/prisma';
import IPayload from '../shared/types/IPayload.interface';

@Injectable()
export class ValidateTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async run(body: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      const payload = this.jwtService.verify<IPayload>(body.token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, name: true, lastName: true, role: true, status: true },
      });

      if (!user) throw new UnauthorizedException('User not found');
      if (user.status === UserStatus.inactive) throw new UnauthorizedException('User is inactive');

      return { isValid: true, user };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid token';

      return { isValid: false, user: undefined, message };
    }
  }
}
