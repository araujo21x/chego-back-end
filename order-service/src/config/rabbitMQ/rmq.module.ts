// src/rmq/rmq.module.ts
import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_EVENT_BUS',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE || 'order_events_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [RmqService],
  exports: [ClientsModule, RmqService],
})
export class RmqModule implements OnModuleInit {
  private readonly logger = new Logger(RmqModule.name);

  constructor(@Inject('RABBITMQ_EVENT_BUS') private readonly rmqClient: ClientProxy) {}

  async onModuleInit() {
    this.logger.log('RmqModule: Attempting to connect to RabbitMQ...');

    try {
      await this.rmqClient.connect();
      this.logger.log('RmqModule: Successfully connected to RabbitMQ.');
    } catch (error) {
      this.logger.error('RmqModule: Failed to connect to RabbitMQ', JSON.stringify(error));
    }
  }
}
