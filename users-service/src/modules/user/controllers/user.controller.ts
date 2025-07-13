import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateUserService } from '../services/create-user.service';
import type { RegisterUserRequest, UserResponse } from '../../../../../proto/users.proto';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller()
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @GrpcMethod('UserService', 'RegisterUser')
  create(data: RegisterUserRequest): Promise<UserResponse> {
    return this.createUserService.run(data as CreateUserDto);
  }
}
