import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private register: client.Registry;
  public grpcCallCounter: client.Counter<string>;
  public grpcCallDurationSeconds: client.Histogram<string>;
  public grpcErrorCounter: client.Counter<string>;

  onModuleInit() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    // Métrica de contador para chamadas gRPC
    this.grpcCallCounter = new client.Counter({
      name: 'grpc_calls_total',
      help: 'Total number of gRPC calls',
      labelNames: ['service', 'method', 'status_code'],
      registers: [this.register],
    });

    // Métrica de histograma para a latência das chamadas gRPC
    this.grpcCallDurationSeconds = new client.Histogram({
      name: 'grpc_call_duration_seconds',
      help: 'Duration of gRPC calls in seconds',
      labelNames: ['service', 'method', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.register],
    });

    // Métrica de contador para erros gRPC
    this.grpcErrorCounter = new client.Counter({
      name: 'grpc_errors_total',
      help: 'Total number of gRPC errors',
      labelNames: ['service', 'method', 'status_code'],
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
