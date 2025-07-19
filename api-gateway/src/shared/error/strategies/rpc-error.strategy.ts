import { ArgumentsHost, HttpStatus, Injectable } from '@nestjs/common';
import { DetailsError, ErrorHandlingStrategy, StandardErrorResponse } from './error-handling.strategy';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

interface GrpcErrorObject {
  code?: GrpcStatus;
  message?: string;
  details?: string;
  [key: string]: any;
}

@Injectable()
export class RpcErrorStrategy extends ErrorHandlingStrategy {
  private readonly GRPC_STATUS_RESPONSE = {
    [GrpcStatus.UNKNOWN]: (message: string = 'Unknown error', details: DetailsError = {}): StandardErrorResponse => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorType: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      details,
    }),
    [GrpcStatus.INVALID_ARGUMENT]: (message: string = 'Invalid argument', details: DetailsError = {}) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      errorType: 'INVALID_ARGUMENT',
      timestamp: new Date().toISOString(),
      details,
    }),
    [GrpcStatus.UNAUTHENTICATED]: (message: string = 'Unauthenticated', details: DetailsError = {}) => ({
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      errorType: 'UNAUTHENTICATED',
      timestamp: new Date().toISOString(),
      details,
    }),
    [GrpcStatus.PERMISSION_DENIED]: (message: string = 'Permission denied', details: DetailsError = {}) => ({
      statusCode: HttpStatus.FORBIDDEN,
      message,
      errorType: 'PERMISSION_DENIED',
      timestamp: new Date().toISOString(),
      details,
    }),
    [GrpcStatus.NOT_FOUND]: (message: string = 'Not found', details: DetailsError = {}) => ({
      statusCode: HttpStatus.NOT_FOUND,
      message,
      errorType: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
      details,
    }),
    [GrpcStatus.ALREADY_EXISTS]: (message: string = 'Already exists', details: DetailsError = {}) => ({
      statusCode: HttpStatus.CONFLICT,
      message,
      errorType: 'ALREADY_EXISTS',
      timestamp: new Date().toISOString(),
      details,
    }),
    [GrpcStatus.UNAVAILABLE]: (message: string = 'Service unavailable', details: DetailsError = {}) => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message,
      errorType: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString(),
      details,
    }),
    [GrpcStatus.INTERNAL]: (message: string = 'Internal server error', details: DetailsError = {}) => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorType: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      details,
    }),
    default: (message: string = 'Unknown error', details: DetailsError = {}) => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `gRPC Error: ${message}`,
      errorType: 'GENERIC_GRPC_ERROR',
      timestamp: new Date().toISOString(),
      details,
    }),
  };

  public supports(error: any): boolean {
    if (error instanceof RpcException) return true;

    return 'code' in error && 'details' in error;
  }

  public handleError(error: RpcException, host: ArgumentsHost): StandardErrorResponse {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const path = request?.url;

    const defaultError: StandardErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errorType: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      details: { rpcCode: 'UNKNOWN', originalMessage: error.message, path: path },
    };

    const rpcError = error.getError?.() || error || null;
    console.log('aqui rpcError');
    if (rpcError === null) return defaultError;
    if (typeof rpcError === 'object') return this.handlerObjectError(rpcError);
    if (typeof rpcError === 'string') return this.handleStringError(rpcError);

    return defaultError;
  }

  private handlerObjectError(rpcError: GrpcErrorObject, path?: string): StandardErrorResponse {
    const rpcCode = rpcError?.code || GrpcStatus.UNKNOWN;
    const grpcMessage = String(rpcError?.details || rpcError?.message || 'An unknown gRPC error occurred.');
    console.log('aqui rpcError object');
    if (rpcCode in this.GRPC_STATUS_RESPONSE) {
      return this.GRPC_STATUS_RESPONSE[rpcCode as keyof typeof this.GRPC_STATUS_RESPONSE](grpcMessage, { path: path });
    }

    return this.GRPC_STATUS_RESPONSE.default(grpcMessage, { path: path });
  }

  private handleStringError(rpcError: string, path?: string): StandardErrorResponse {
    console.log('aqui rpcError string');
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `gRPC Error: ${rpcError}`,
      errorType: 'GENERIC_GRPC_ERROR',
      timestamp: new Date().toISOString(),
      details: { rpcCode: 'UNKNOWN', path: path },
    };
  }
}
