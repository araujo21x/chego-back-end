import { ArgumentsHost, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorHandlingStrategy, StandardErrorResponse } from './error-handling.strategy';

@Injectable()
export class HttpErrorStrategy extends ErrorHandlingStrategy {
  DEFAULT_ERROR = (message: string = 'Internal server error', path?: string) => ({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message,
    errorType: 'HTTP_ERROR',
    timestamp: new Date().toISOString(),
    details: { originalMessage: 'Internal server error', path },
  });

  supports(error: Error): boolean {
    return error instanceof HttpException;
  }

  handleError(error: HttpException, host: ArgumentsHost): StandardErrorResponse {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const status = error.getStatus();

    const errorResponse = error.getResponse();

    if (errorResponse === null) return this.DEFAULT_ERROR(undefined, request?.url);
    if (typeof errorResponse === 'string') return this.buildError(errorResponse, status, request?.url);
    if (typeof errorResponse === 'object') {
      const errorObj = errorResponse as { message?: string };
      return this.buildError(errorObj?.message || JSON.stringify(errorObj), status, request?.url);
    }

    return this.DEFAULT_ERROR(request?.url);
  }

  private buildError(message: string, status: number = 400, path?: string): StandardErrorResponse {
    return {
      statusCode: status,
      message,
      errorType: 'HTTP_ERROR',
      timestamp: new Date().toISOString(),
      details: { path },
    };
  }
}
