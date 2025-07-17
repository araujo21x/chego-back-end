import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
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

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}
  onModuleInit() {
    this.usersService = this.client.getService<UserServiceClient>('UserService');
  }

  @Post('register')
  async register(@Body() registerDto: RegisterUserRequest): Promise<UserResponse> {
    return await lastValueFrom(this.usersService.registerUser(registerDto));
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserRequest): Promise<LoginResponse> {
    return await lastValueFrom(this.usersService.loginUser(loginDto));
  }
}
