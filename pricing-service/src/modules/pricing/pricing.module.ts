import { Module } from '@nestjs/common';
import { CalculatePriceService } from './services/calculate-price.service';
import { PricingController } from './controllers/pricing.controller';

@Module({
  controllers: [PricingController],
  providers: [CalculatePriceService],
})
export class PricingModule {}
