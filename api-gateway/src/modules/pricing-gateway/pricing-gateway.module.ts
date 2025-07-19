import { Module } from '@nestjs/common';
import { PricingGatewayController } from './controllers/pricing-gateway.controller';
import { AuthModule } from '../auth/auth.module';
import { GrpcModule } from 'src/config/grpc/grpc.module';

@Module({
  imports: [AuthModule, GrpcModule],
  controllers: [PricingGatewayController],
  providers: [],
})
export class PricingGatewayModule {}
