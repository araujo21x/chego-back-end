import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { CreateUserService } from './services/create-user.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [CreateUserService],
})
export class UserModule {}
