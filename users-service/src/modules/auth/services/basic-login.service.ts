import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { LoginResponse, LoginUserRequest } from 'src/shared/proto/users';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import IPayload from '../shared/types/IPayload.interface';

@Injectable()
export class BasicLoginService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async run(body: LoginUserRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, password: true, name: true, lastName: true, role: true, status: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    const payload: IPayload = { email: user.email, id: user.id, role: user.role };

    return { token: this.jwtService.sign(payload), user };
  }
}
