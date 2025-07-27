import { Module } from '@nestjs/common';
import { OrderEventsConsumerController } from './controllers/order-events.controller';
import { RmqModule } from 'src/config/rabbitMQ/rmq.module';

@Module({
  imports: [RmqModule],
  controllers: [OrderEventsConsumerController],
  providers: [],
})
export class OrderEventsConsumerModule {}
