import { Body, Controller, Inject, Patch, Post } from '@nestjs/common';
import {
  CancelOrderRequest,
  CancelOrderResponse,
  OrderResponse,
  OrderServiceClient,
  RegisterOrderRequest,
} from 'src/shared/proto/order';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { GrpcCircuitBreakerWrapper } from 'src/shared/circuit-breakers/circuit-breaker.wrapper';

@Controller('order')
export class OrderController {
  private ordersService: OrderServiceClient;

  constructor(
    @Inject('ORDER_SERVICE') private readonly client: ClientGrpc,
    @Inject('ORDER_SERVICE_REGISTER_BREAKER') private readonly registerOrderBreaker: GrpcCircuitBreakerWrapper,
    @Inject('ORDER_SERVICE_CANCEL_BREAKER') private readonly cancelOrderBreaker: GrpcCircuitBreakerWrapper,
  ) {}
  onModuleInit() {
    this.ordersService = this.client.getService<OrderServiceClient>('OrderService');
  }

  @Post('register')
  async register(@Body() body: RegisterOrderRequest): Promise<OrderResponse> {
    return await lastValueFrom(this.registerOrderBreaker.execute(this.ordersService.registerOrder(body)));
  }

  @Patch('cancel')
  async cancel(@Body() Body: CancelOrderRequest): Promise<CancelOrderResponse> {
    return await lastValueFrom(this.cancelOrderBreaker.execute(this.ordersService.cancelOrder(Body)));
  }
}
