export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  lastName: string;
  role?: string;
  status?: string;
}
