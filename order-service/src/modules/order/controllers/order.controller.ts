import { Controller } from '@nestjs/common';
import { CreateOrderService } from '../services/create-order.service';
import { CancelOrderService } from '../services/cancel-order.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CancelOrderRequest, CancelOrderResponse, OrderResponse, RegisterOrderRequest } from 'src/shared/proto/order';

@Controller()
export class OrderController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly cancelOrderService: CancelOrderService,
  ) {}

  @GrpcMethod('OrderService', 'RegisterOrder')
  async register(body: RegisterOrderRequest): Promise<OrderResponse> {
    const answer = await this.createOrderService.run(body);
    return answer;
  }

  @GrpcMethod('OrderService', 'CancelOrder')
  async cancel(body: CancelOrderRequest): Promise<CancelOrderResponse> {
    const answer = await this.cancelOrderService.run(body);
    return answer;
  }
}
