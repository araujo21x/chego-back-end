import { Controller } from '@nestjs/common';
import { CalculatePriceService } from '../services/calculate-price.service';
import { GrpcMethod } from '@nestjs/microservices';
import { GetPriceQuoteRequest, PriceQuoteResponse } from 'src/shared/proto/pricing';

@Controller()
export class PricingController {
  constructor(private readonly calculatePriceService: CalculatePriceService) {}

  @GrpcMethod('PricingService', 'GetPriceQuote')
  getQuote(data: GetPriceQuoteRequest): PriceQuoteResponse {
    return this.calculatePriceService.run(data);
  }
}
