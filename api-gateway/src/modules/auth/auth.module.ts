import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [JwtAuthGuard],
  imports: [JwtAuthGuard],
})
export class AuthModule {}
