import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ErrorHandlerContext } from '../error/error-handler.context';
import { StandardErrorResponse } from '../error/strategies/error-handling.strategy';

@Catch()
export class HttpRpcExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorHandlerContext: ErrorHandlerContext) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorToHandle = exception instanceof Error ? exception : new Error(String(exception));
    const errorResponse: StandardErrorResponse = this.errorHandlerContext.handleError(errorToHandle, host);

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
