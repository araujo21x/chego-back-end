import * as CircuitBreaker from 'opossum';
import { Observable, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

// Funções auxiliares para verificar se um erro é um gRPC RpcException e seu código
const isRpcException = (error: any): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'number' &&
    ('details' in error || 'message' in error)
  );
};

const getRpcCode = (error: any): GrpcStatus => {
  return isRpcException(error) ? error.code : GrpcStatus.UNKNOWN;
};

export class GrpcCircuitBreakerWrapper {
  private breaker: CircuitBreaker;
  private readonly serviceName: string;
  private readonly methodName: string;

  constructor(serviceName: string, methodName: string, options?: CircuitBreaker.Options) {
    this.serviceName = serviceName;
    this.methodName = methodName;

    const defaultOptions: CircuitBreaker.Options = {
      timeout: 5000, // Se a operação não retornar em 5 segundos, falha (timeout)
      errorThresholdPercentage: 50, // Se 50% das últimas chamadas falharem
      resetTimeout: 10000, // Após 10 segundos, tenta novamente (estado half-open)
      rollingCountTimeout: 10000, // Janela para contar sucessos/falhas
      rollingCountBuckets: 10, // Número de "baldes" na janela de tempo
      // Define quais erros devem ser considerados falhas para o Circuit Breaker
      errorFilter: (err: any) => {
        // Erros que devem abrir o circuito:
        // UNAVAILABLE (serviço caiu), DEADLINE_EXCEEDED (timeout), INTERNAL (erro interno genérico),
        // UNKNOWN (erro de comunicação)
        const grpcCode = getRpcCode(err);
        const shouldCountAsFailure = [
          GrpcStatus.UNAVAILABLE,
          GrpcStatus.DEADLINE_EXCEEDED,
          GrpcStatus.INTERNAL,
          GrpcStatus.UNKNOWN,
        ].includes(grpcCode);

        // Se for um erro HTTP que foi mapeado para gRPC (ex: BAD_REQUEST, UNAUTHENTICATED),
        // geralmente NÃO queremos que ele abra o circuito, pois é um erro de cliente/lógica, não de infra.
        const shouldNotCountAsFailure = [
          GrpcStatus.INVALID_ARGUMENT,
          GrpcStatus.UNAUTHENTICATED,
          GrpcStatus.PERMISSION_DENIED,
          GrpcStatus.NOT_FOUND,
          GrpcStatus.ALREADY_EXISTS,
        ].includes(grpcCode);

        if (shouldNotCountAsFailure) {
          return false; // Não conta como falha para o Circuit Breaker
        }
        return shouldCountAsFailure; // Conta como falha para o Circuit Breaker
      },
      ...options,
    };

    this.breaker = new CircuitBreaker(async (fn: Function, ...args: any[]) => {
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

  // Método para executar a função através do Circuit Breaker
  execute<T>(grpcCall: Observable<T>): Observable<T> {
    return from(
      this.breaker.fire(async () => {
        // Converte o Observable gRPC para uma Promise para que o Opossum possa rastrear
        return await new Promise<T>((resolve, reject) => {
          grpcCall.subscribe({
            next: (val) => resolve(val),
            error: (err) => {
              // O Circuit Breaker precisa que o erro seja rejeitado para contá-lo.
              // Passamos o erro original gRPC para que o errorFilter do Opossum possa inspecioná-lo.
              reject(err);
            },
            complete: () => {},
          });
        });
      }),
    ).pipe(
      catchError((err) => {
        // Se o Opossum lançar um erro (ex: circuito aberto, timeout),
        // transformamos isso em uma RpcException apropriada para ser tratada pelo HttpRpcExceptionFilter.
        if (err instanceof CircuitBreaker.CircuitBreakerError) {
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
