import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { GrpcCircuitBreakerWrapper } from 'src/shared/circuit-breakers/circuit-breaker.wrapper';
import { GrpcModule } from 'src/config/grpc/grpc.module';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: 'ORDER_SERVICE_REGISTER_BREAKER',
      useValue: new GrpcCircuitBreakerWrapper('OrderService', 'RegisterOrder'),
    },
    {
      provide: 'ORDER_SERVICE_CANCEL_BREAKER',
      useValue: new GrpcCircuitBreakerWrapper('OrderService', 'CancelOrder'),
    },
  ],
  imports: [GrpcModule],
  exports: ['ORDER_SERVICE_REGISTER_BREAKER', 'ORDER_SERVICE_CANCEL_BREAKER'],
})
export class OrderModule {}
