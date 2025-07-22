import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private register: client.Registry;
  public httpRequestCounter: client.Counter<string>;
  public httpRequestDurationSeconds: client.Histogram<string>;
  public httpErrorCounter: client.Counter<string>;

  onModuleInit() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    // Counter metric for HTTP requests
    this.httpRequestCounter = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    // Histogram metric for HTTP request latency
    this.httpRequestDurationSeconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Buckets for latency
      registers: [this.register],
    });

    // Counter metric for HTTP errors
    this.httpErrorCounter = new client.Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
