import { Module } from '@nestjs/common';
import { MetricsService } from './services/metrics.service';
import { MetricsController } from './controllers/metrics.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { RmqModule } from 'src/config/rabbitMQ/rmq.module';

@Module({
  imports: [PrismaModule, RmqModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
