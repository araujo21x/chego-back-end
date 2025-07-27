import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrpcModule } from './config/grpc/grpc.module';
import { OrderModule } from './modules/order/order.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { RmqModule } from './config/rabbitMQ/rmq.module';
import { MetricsModule } from './config/monitoring/metrics/metrics.module';

@Module({
  imports: [MetricsModule, GrpcModule, RmqModule, PrismaModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
