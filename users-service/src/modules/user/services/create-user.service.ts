import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class CreateUserService {
  async run(createUserDto: CreateUserDto): Promise<string> {
    console.log(createUserDto);
    return 'This action adds a new user';
  }
}
