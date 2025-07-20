import { Module } from '@nestjs/common';
import { PricingGatewayController } from './controllers/pricing-gateway.controller';
import { AuthModule } from '../auth/auth.module';
import { GrpcModule } from 'src/config/grpc/grpc.module';
import { GrpcCircuitBreakerWrapper } from 'src/shared/circuit-breakers/circuit-breaker.wrapper';

@Module({
  imports: [AuthModule, GrpcModule],
  controllers: [PricingGatewayController],
  providers: [
    {
      provide: 'PRICING_SERVICE_GET_PRICE_QUOTE',
      useValue: new GrpcCircuitBreakerWrapper('PricingService', 'GetPriceQuote'),
    },
  ],
})
export class PricingGatewayModule {}
