import { ArgumentsHost, HttpStatus } from '@nestjs/common';

export interface DetailsError {
  [key: string]: unknown;
}

export interface StandardErrorResponse {
  statusCode: HttpStatus;
  message: string;
  timestamp: string;
  errorType: string;
  details?: DetailsError;
}

export abstract class ErrorHandlingStrategy {
  abstract supports(error: Error): boolean;
  abstract handleError(error: Error, host: ArgumentsHost): StandardErrorResponse;
}
