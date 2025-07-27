import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from './config/monitoring/metrics/metrics.module';
import { RmqModule } from './config/rabbitMQ/rmq.module';
import { OrderEventsConsumerModule } from './consumers/order-events/order-events.module';

@Module({
  imports: [
    MetricsModule,
    RmqModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    OrderEventsConsumerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
