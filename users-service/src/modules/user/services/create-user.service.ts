import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponse } from 'src/shared/proto/users';
import { PrismaService } from 'src/database/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class CreateUserService {
  constructor(private readonly prisma: PrismaService) {}

  async run(createUserDto: CreateUserDto): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        lastName: createUserDto.lastName,
        role: createUserDto.role as UserRole | undefined,
      },
    });
  }
}
