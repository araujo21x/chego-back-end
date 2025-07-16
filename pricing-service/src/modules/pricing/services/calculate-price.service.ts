import { Injectable } from '@nestjs/common';
import { GetPriceQuoteRequest, PriceQuoteResponse } from 'src/shared/proto/pricing';

@Injectable()
export class CalculatePriceService {
  run(data: GetPriceQuoteRequest): PriceQuoteResponse {
    return {
      distance: data.distance,
      price: data.distance * 10,
      currency: 'BRL',
    };
  }
}
