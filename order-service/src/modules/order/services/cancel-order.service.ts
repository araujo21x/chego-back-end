import { Injectable } from '@nestjs/common';
import { OrderStatus } from 'generated/prisma';
import { RmqService } from 'src/config/rabbitMQ/rmq.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import convertNullToUndefined from 'src/shared/helpers/convertNullToUndefined';
import { CancelOrderRequest, CancelOrderResponse, Order } from 'src/shared/proto/order';

@Injectable()
export class CancelOrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly rmqService: RmqService,
  ) {}

  async run(body: CancelOrderRequest): Promise<CancelOrderResponse> {
    try {
      const order = await this.prismaService.order.update({
        where: { id: body.orderId },
        data: { status: OrderStatus.cancelled },
      });

      this.rmqService.emit('order_cancelled', order);
      // this.rmqService.emit('order_cancelled_for_notification', order);

      return { message: 'Order cancelled!', order: convertNullToUndefined<Order>(order) };
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(`Failed to cancel order: ${error.message}`);
      throw new Error(`Failed to cancel order: ${JSON.stringify(error)}`);
    }
  }
}
