import { HttpException } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
  }
}
