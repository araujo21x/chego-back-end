import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { PriceQuoteResponse, PricingServiceClient } from 'src/shared/proto/pricing';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { lastValueFrom } from 'rxjs';
import { GrpcCircuitBreakerWrapper } from 'src/shared/circuit-breakers/circuit-breaker.wrapper';

@Controller('pricing')
export class PricingGatewayController {
  private pricingService: PricingServiceClient;

  constructor(
    @Inject('PRICING_SERVICE') private readonly client: ClientGrpc,
    @Inject('PRICING_SERVICE_GET_PRICE_QUOTE') private readonly getPriceQuoteBreaker: GrpcCircuitBreakerWrapper,
  ) {}

  onModuleInit() {
    this.pricingService = this.client.getService<PricingServiceClient>('PricingService');
  }

  @UseGuards(JwtAuthGuard)
  @Get('quote')
  async getPricingQuote(@Query('distance') distance: number): Promise<PriceQuoteResponse> {
    return lastValueFrom(
      this.getPriceQuoteBreaker.execute(this.pricingService.getPriceQuote({ distance: Number(distance) })),
    );
  }
}
