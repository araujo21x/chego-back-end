import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GrpcModule } from 'src/config/grpc/grpc.module';
import { GrpcCircuitBreakerWrapper } from 'src/shared/circuit-breakers/circuit-breaker.wrapper';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    {
      provide: 'USER_SERVICE_REGISTER_BREAKER',
      useValue: new GrpcCircuitBreakerWrapper('UserService', 'RegisterUser'),
    },
    {
      provide: 'USER_SERVICE_LOGIN_BREAKER',
      useValue: new GrpcCircuitBreakerWrapper('UserService', 'LoginUser'),
    },
    {
      provide: 'USER_SERVICE_VALIDATE_TOKEN_BREAKER',
      useValue: new GrpcCircuitBreakerWrapper('UserService', 'ValidateToken'),
    },
  ],
  imports: [GrpcModule],
  exports: ['USER_SERVICE_REGISTER_BREAKER', 'USER_SERVICE_LOGIN_BREAKER', 'USER_SERVICE_VALIDATE_TOKEN_BREAKER'],
})
export class AuthModule {}
