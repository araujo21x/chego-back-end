import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PricingGatewayModule } from './modules/pricing-gateway/pricing-gateway.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GrpcModule } from './config/grpc/grpc.module';
import { HttpRpcExceptionFilter } from './shared/filter/http-rpc-exception.filter';
import { ErrorModule } from './shared/error/error.module';
import { MetricsModule } from './config/monitoring/metrics/metrics.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    MetricsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    ErrorModule,
    GrpcModule,
    AuthModule,
    PricingGatewayModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpRpcExceptionFilter },
  ],
})
export class AppModule {}
