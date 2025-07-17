import { Module } from '@nestjs/common';
import { PricingGatewayController } from './controllers/pricing-gateway.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PricingGatewayController],
  providers: [],
})
export class PricingGatewayModule {}
