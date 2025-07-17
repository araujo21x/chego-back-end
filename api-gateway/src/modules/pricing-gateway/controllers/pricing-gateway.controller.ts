import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { PriceQuoteResponse, PricingServiceClient } from 'src/shared/proto/pricing';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { lastValueFrom } from 'rxjs';

@Controller('pricing')
export class PricingGatewayController {
  private pricingService: PricingServiceClient;

  constructor(@Inject('PRICING_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.pricingService = this.client.getService<PricingServiceClient>('PricingService');
  }

  @UseGuards(JwtAuthGuard)
  @Get('quote')
  async getPricingQuote(@Query('distance') distance: number): Promise<PriceQuoteResponse> {
    return lastValueFrom(this.pricingService.getPriceQuote({ distance: Number(distance) }));
  }
}
