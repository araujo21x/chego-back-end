import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserRequest, User } from 'src/shared/proto/users';
import { PrismaService } from 'src/database/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../../../../generated/prisma';

@Injectable()
export class RegisterUserService {
  constructor(private readonly prisma: PrismaService) {}

  async run(body: RegisterUserRequest): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (user) throw new BadRequestException('User already exists');

    const registeredUser = await this.prisma.user.create({ data: await this.buildUser(body) });
    return registeredUser;
  }

  private async buildUser(body: RegisterUserRequest) {
    return {
      email: body.email,
      password: await bcrypt.hash(body.password, 10),
      name: body.name,
      lastName: body.lastName,
      role: body.role as UserRole,
    };
  }
}
