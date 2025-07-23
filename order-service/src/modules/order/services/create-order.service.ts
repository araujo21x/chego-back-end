import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OrderStatus, PaymentMethod } from 'generated/prisma';
import { firstValueFrom } from 'rxjs';
import { RmqService } from 'src/config/rabbitMQ/rmq.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import convertNullToUndefined from 'src/shared/helpers/convertNullToUndefined';
import { Order, OrderResponse, RegisterOrderRequest, RegisterOrderRequestAddress } from 'src/shared/proto/order';
import { PriceQuoteResponse, PricingServiceClient } from 'src/shared/proto/pricing';
import { User, UserServiceClient } from 'src/shared/proto/users';

interface ICreateOrder {
  body: RegisterOrderRequest;
  user: User;
  pricingResponse: PriceQuoteResponse;
}

@Injectable()
export class CreateOrderService implements OnModuleInit {
  private userServiceGrpc: UserServiceClient;
  private pricingServiceGrpc: PricingServiceClient;

  constructor(
    @Inject('USER_SERVICE') private readonly userClientGrpc: ClientGrpc,
    @Inject('PRICING_SERVICE') private readonly pricingClientGrpc: ClientGrpc,
    private readonly prismaService: PrismaService,
    private readonly rmqService: RmqService,
  ) {}

  onModuleInit() {
    this.userServiceGrpc = this.userClientGrpc.getService<UserServiceClient>('UserService');
    this.pricingServiceGrpc = this.pricingClientGrpc.getService<PricingServiceClient>('PricingService');
  }

  async run(body: RegisterOrderRequest): Promise<OrderResponse> {
    try {
      const { user } = await firstValueFrom(this.userServiceGrpc.getUser({ userId: body.userId }));
      if (!user) throw new Error('User not found');

      const pricingResponse = await firstValueFrom(this.pricingServiceGrpc.getPriceQuote({ distance: body.distance }));
      if (!pricingResponse) throw new Error('User not found');

      const order = await this.prismaService.order.create({ data: this.buildOrder({ body, user, pricingResponse }) });

      this.rmqService.emit('order_created_for_acceptance', order);
      // this.rmqService.emit('order_created_for_notification', user);

      return { message: 'Order created and pending acceptance!', order: convertNullToUndefined<Order>(order) };
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(`Failed to create order: ${error.message}`);
      throw new Error(`Failed to create order: ${JSON.stringify(error)}`);
    }
  }

  private buildOrder(data: ICreateOrder) {
    const { body, user, pricingResponse } = data;

    return {
      userId: user.id,
      userName: user.name,
      userLastName: user.lastName,
      comment: body.comment,
      value: pricingResponse.price,
      total: pricingResponse.price,
      paymentMethod: PaymentMethod.credit_card,
      status: OrderStatus.pending,
      address: { create: this.buildAddress(body.address as RegisterOrderRequestAddress) },
    };
  }

  private buildAddress(address: RegisterOrderRequestAddress) {
    return {
      address: address.address,
      neighborhood: address.neighborhood,
      number: address.number,
      complement: address.complement,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      latitude: address.latitude,
      longitude: address.longitude,
    };
  }
}
