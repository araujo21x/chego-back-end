import { Module } from '@nestjs/common';
import { CreateOrderService } from './services/create-order.service';
import { OrderController } from './controllers/order.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [CreateOrderService],
})
export class OrderModule {}
