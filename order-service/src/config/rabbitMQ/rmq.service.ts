// src/rmq/rmq.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RmqService {
  constructor(@Inject('RABBITMQ_EVENT_BUS') private readonly client: ClientProxy) {}

  async connect(): Promise<void> {
    await this.client.connect();
    console.log('Connected to RabbitMQ event bus.');
  }

  emit(pattern: string, data: any): void {
    this.client.emit(pattern, data);
  }

  async send<TResult = any, TInput = any>(pattern: string, data: TInput): Promise<TResult> {
    return await firstValueFrom(this.client.send(pattern, data));
  }
}
