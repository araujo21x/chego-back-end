import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrpcModule } from './config/grpc/grpc.module';
import { OrderModule } from './modules/order/order.module';
import { PrismaModule } from './database/prisma/prisma.module';

@Module({
  imports: [GrpcModule, PrismaModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
