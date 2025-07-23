import { Controller } from '@nestjs/common';
import { CreateOrderService } from '../services/create-order.service';

@Controller()
export class OrderController {
  constructor(private readonly createOrderService: CreateOrderService) {}
}
