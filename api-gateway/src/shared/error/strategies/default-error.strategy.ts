/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArgumentsHost, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHandlingStrategy, StandardErrorResponse } from './error-handling.strategy';

@Injectable()
export class DefaultErrorStrategy extends ErrorHandlingStrategy {
  supports(_error: Error): boolean {
    return true;
  }

  handleError(error: Error, host: ArgumentsHost): StandardErrorResponse {
    let path: string | undefined;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    if (request && request.url) path = request.url;

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Ocorreu um erro interno inesperado.',
      errorType: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      details: {
        path,
        originalName: error.name,
        originalMessage: error.message,
        stack: process.env.NODE_ENV === 'dev' ? error.stack : undefined,
      },
    };
  }
}
