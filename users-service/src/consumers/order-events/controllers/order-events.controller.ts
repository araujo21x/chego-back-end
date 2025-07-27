// src/consumers/order-events/order-events.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { RmqService } from 'src/config/rabbitMQ/rmq.service';

@Controller()
export class OrderEventsConsumerController {
  constructor(private readonly rmqService: RmqService) {}

  @EventPattern('order_created_for_acceptance')
  async handleOrderCreatedForAcceptance(data: {
    orderId: string;
    userId: string;
    username: string;
    totalPrice: number;
    items: string[];
  }): Promise<void> {
    console.log(
      `[User Service - Consumer] Received "order_created_for_acceptance" for userId: ${data.userId}, orderId: ${data.orderId}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const decisionStatus: 'accepted' | 'rejected' = Math.random() > 0.3 ? 'accepted' : 'rejected';

    console.log(`[User Service - Consumer] Simulating user decision for order ${data.orderId}: ${decisionStatus}`);
  }

  @EventPattern('order_cancelled')
  handleOrderCancelled(data: { orderId: string; userId: string; reason: string; cancelledBy: string }): void {
    console.log(
      `[User Service - Consumer] Received "order_cancelled" for userId: ${data.userId}, orderId: ${data.orderId}. Reason: ${data.reason}`,
    );
  }
}
