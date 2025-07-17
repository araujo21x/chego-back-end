import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PricingGatewayModule } from './modules/pricing-gateway/pricing-gateway.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../proto/users.proto'),
          url: 'localhost:50051', // <-- ATENÇÃO: Use localhost se rodando localmente, users-service se em Docker
        },
      },
      {
        name: 'PRICING_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'pricing',
          protoPath: join(__dirname, '../../proto/pricing.proto'),
          url: 'localhost:50052', // <-- ATENÇÃO: Use localhost se rodando localmente, pricing-service se em Docker
        },
      },
    ]),
    AuthModule,
    PricingGatewayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
