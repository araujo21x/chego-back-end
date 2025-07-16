import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  LoginResponse,
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from 'src/shared/proto/users';
import { RegisterUserService } from '../services/register-user.service';
import { BasicLoginService } from '../services/basic-login.service';
import { ValidateTokenService } from '../services/validate-token.service';

@Controller()
export class AuthController {
  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly basicLoginService: BasicLoginService,
    private readonly validateTokenService: ValidateTokenService,
  ) {}

  @GrpcMethod('UserService', 'RegisterUser')
  async register(body: RegisterUserRequest): Promise<UserResponse> {
    const user = await this.registerUserService.run(body);
    return { user, message: 'User registered successfully' };
  }

  @GrpcMethod('UserService', 'LoginUser')
  async login(body: LoginUserRequest): Promise<LoginResponse> {
    const answer = await this.basicLoginService.run(body);

    return answer;
  }

  @GrpcMethod('UserService', 'ValidateToken')
  async validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    const answer = await this.validateTokenService.run(data);

    return answer;
  }
}
