/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class GrpcRetryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const MAX_RETRIES = 3;
    const retryableGrpcCodes = [GrpcStatus.UNAVAILABLE, GrpcStatus.INTERNAL, GrpcStatus.DEADLINE_EXCEEDED];

    return next.handle().pipe(
      retry({
        count: MAX_RETRIES,
        delay: (error: any, retryCount) => {
          const isRpcError =
            typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number';

          const grpcCode: GrpcStatus = isRpcError ? error?.code : GrpcStatus.UNKNOWN;
          if (!retryableGrpcCodes.includes(grpcCode)) return throwError(() => error);

          const delayTime = Math.pow(2, retryCount - 1) * 100;
          return new Observable((subscriber) => {
            setTimeout(() => subscriber.complete(), delayTime);
          });
        },
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
