import { Module } from '@nestjs/common';
import { CreateOrderService } from './services/create-order.service';
import { OrderController } from './controllers/order.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { CancelOrderService } from './services/cancel-order.service';
import { RmqModule } from 'src/config/rabbitMQ/rmq.module';

@Module({
  imports: [PrismaModule, RmqModule],
  controllers: [OrderController],
  providers: [CreateOrderService, CancelOrderService],
})
export class OrderModule {}
