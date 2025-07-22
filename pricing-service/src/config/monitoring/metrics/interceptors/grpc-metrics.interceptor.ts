/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// users-service/src/config/monitoring/metrics/grpc-metrics.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class GrpcMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}
  private readonly logger = new Logger(GrpcMetricsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const grpcContext = context.switchToRpc();
    const data = grpcContext.getData();
    const call = grpcContext.getContext();

    const metadata = call?.metadata ?? undefined;

    const method = context.getHandler().name;
    const service = context.getClass().name;

    const end = this.metricsService.grpcCallDurationSeconds.startTimer();

    return next.handle().pipe(
      tap(() => {
        this.metricsService.grpcCallCounter.inc({ service, method, status_code: '200' });
        end({ service, method, status_code: '200' });
      }),
      catchError((err) => {
        const statusCode =
          err instanceof RpcException ? (err as { code?: GrpcStatus })?.code?.toString() : GrpcStatus.UNKNOWN;
        this.logger.error('--------------------------------');
        this.logger.error(`---Error ${method} - ${service} ---`);
        this.logger.error(`[GRPC_METRICS_INTERCEPTOR] ${method} - ${service} - data: ${JSON.stringify(data)}`);
        this.logger.error(`[GRPC_METRICS_INTERCEPTOR] ${method} - ${service} - metadata: ${JSON.stringify(metadata)}`);
        this.logger.error(`[GRPC_METRICS_INTERCEPTOR] ${method} - ${service} - call: ${JSON.stringify(call)}`);
        this.logger.error('--------------------------------');

        this.metricsService.grpcErrorCounter.inc({ service, method, status_code: statusCode });
        end({ service, method, status_code: statusCode });
        throw err;
      }),
    );
  }
}
