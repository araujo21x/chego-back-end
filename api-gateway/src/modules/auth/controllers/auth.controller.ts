import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { GrpcCircuitBreakerWrapper } from 'src/shared/circuit-breakers/circuit-breaker.wrapper';
import {
  LoginResponse,
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
  UserServiceClient,
} from 'src/shared/proto/users';

@Controller('auth')
export class AuthController {
  private usersService: UserServiceClient;

  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientGrpc,
    @Inject('USER_SERVICE_REGISTER_BREAKER') private readonly registerBreaker: GrpcCircuitBreakerWrapper,
    @Inject('USER_SERVICE_LOGIN_BREAKER') private readonly loginBreaker: GrpcCircuitBreakerWrapper,
  ) {}
  onModuleInit() {
    this.usersService = this.client.getService<UserServiceClient>('UserService');
  }

  @Post('register')
  async register(@Body() registerDto: RegisterUserRequest): Promise<UserResponse> {
    return await lastValueFrom(this.registerBreaker.execute(this.usersService.registerUser(registerDto)));
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserRequest): Promise<LoginResponse> {
    return await lastValueFrom(this.loginBreaker.execute(this.usersService.loginUser(loginDto)));
  }
}
