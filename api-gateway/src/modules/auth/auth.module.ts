import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GrpcModule } from 'src/config/grpc/grpc.module';

@Module({
  controllers: [AuthController],
  providers: [JwtAuthGuard],
  imports: [GrpcModule],
})
export class AuthModule {}
