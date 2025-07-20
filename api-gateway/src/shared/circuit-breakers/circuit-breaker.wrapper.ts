/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as CircuitBreaker from 'opossum';
import { Observable, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { RpcErrorStrategy } from '../error/strategies/rpc-error.strategy';

const getRpcCode = (error: unknown): GrpcStatus => {
  const rpcErrorStrategy = new RpcErrorStrategy();
  return rpcErrorStrategy.supports(error) ? (error as { code: GrpcStatus })?.code : GrpcStatus.INTERNAL;
};

export class GrpcCircuitBreakerWrapper {
  private breaker: CircuitBreaker;
  private readonly serviceName: string;
  private readonly methodName: string;

  constructor(serviceName: string, methodName: string, options?: CircuitBreaker.Options) {
    this.serviceName = serviceName;
    this.methodName = methodName;

    const defaultOptions: CircuitBreaker.Options = {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
      errorFilter: (err: unknown) => {
        const grpcCode = getRpcCode(err);
        const shouldCountAsFailure = [
          GrpcStatus.UNAVAILABLE,
          GrpcStatus.DEADLINE_EXCEEDED,
          GrpcStatus.INTERNAL,
          GrpcStatus.UNKNOWN,
        ].includes(grpcCode);

        const shouldNotCountAsFailure = [
          GrpcStatus.INVALID_ARGUMENT,
          GrpcStatus.UNAUTHENTICATED,
          GrpcStatus.PERMISSION_DENIED,
          GrpcStatus.NOT_FOUND,
          GrpcStatus.ALREADY_EXISTS,
        ].includes(grpcCode);

        if (shouldNotCountAsFailure) return false;

        return shouldCountAsFailure;
      },
      ...options,
    };

    this.breaker = new CircuitBreaker((fn: Function, ...args: any[]) => {
      // Opossum espera uma Promise.
      // Certifique-se de que a função gRPC retorne uma Promise (com lastValueFrom)
      return fn(...args);
    }, defaultOptions);

    // Opcional: Logar eventos do Circuit Breaker
    this.breaker.on('open', () => console.warn(`[CircuitBreaker:${serviceName}:${methodName}] Circuito aberto!`));
    this.breaker.on('halfOpen', () =>
      console.warn(`[CircuitBreaker:${serviceName}:${methodName}] Circuito meio-aberto. Tentando novamente...`),
    );
    this.breaker.on('close', () => console.log(`[CircuitBreaker:${serviceName}:${methodName}] Circuito fechado.`));
    this.breaker.on('fallback', (error) =>
      console.error(`[CircuitBreaker:${serviceName}:${methodName}] Fallback acionado:`, error),
    );
    this.breaker.on('fire', (args) => {}); // Chamada normal
    this.breaker.on('success', (result) => {}); // Sucesso
    this.breaker.on('reject', (err) =>
      console.error(
        `[CircuitBreaker:${serviceName}:${methodName}] Requisição rejeitada pelo Circuit Breaker:`,
        err.message,
      ),
    );
  }

  execute<T>(grpcCall: Observable<T>): Observable<T> {
    return from(
      this.breaker.fire(async () => {
        return await new Promise<T>((resolve, reject) => {
          grpcCall.subscribe({
            next: (val) => resolve(val),
            error: (err) => {
              // O Circuit Breaker precisa que o erro seja rejeitado para contá-lo.
              // Passamos o erro original gRPC para que o errorFilter do Opossum possa inspecioná-lo.
              reject(err instanceof Error ? err : new Error(String(err)));
            },
            complete: () => {},
          });
        });
      }) as Promise<T>,
    ).pipe(
      catchError((err) => {
        // Se o Opossum lançar um erro (ex: circuito aberto, timeout),
        // transformamos isso em uma RpcException apropriada para ser tratada pelo HttpRpcExceptionFilter.
        if (CircuitBreaker.isOurError(err)) {
          console.warn(
            `[CircuitBreaker:${this.serviceName}:${this.methodName}] Circuit Breaker ativado. ${err.message}`,
          );
          throw new RpcException({
            code: GrpcStatus.UNAVAILABLE, // Ou DEADLINE_EXCEEDED se for timeout
            details: `Service is currently unavailable due to circuit breaker: ${this.serviceName}.${this.methodName}.`,
          });
        }
        // Se for outro erro, ou o erro original passado pelo breaker, apenas re-lançamos.
        throw err;
      }),
    );
  }
}
