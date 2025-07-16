import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [],
})
export class UserModule {}
