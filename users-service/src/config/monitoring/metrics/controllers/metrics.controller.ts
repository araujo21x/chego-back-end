import { Controller, Get, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from '../services/metrics.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Controller()
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('/metrics')
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4');
    res.end(metrics);
  }

  @Get('/health')
  async getHealth(@Res() res: Response) {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      res.status(200).send('OK');
    } catch (error) {
      Logger.error('Health check failed:', error);
      res.status(500).send('Service unhealthy');
    }
  }
}
