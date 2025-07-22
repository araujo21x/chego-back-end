import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MetricsService } from './config/monitoring/metrics/metrics.service';
import * as express from 'express'; // Importe o express

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const metricsService = app.get(MetricsService);
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const end = metricsService.httpRequestDurationSeconds.startTimer();

    res.on('finish', () => {
      const route: string = (req?.route as { path?: string })?.path ?? req.path;
      const method = req.method;
      const statusCode = res.statusCode.toString();

      metricsService.httpRequestCounter.inc({ method, route, status_code: statusCode });
      end({ method, route, status_code: statusCode });

      if (res.statusCode >= 400) {
        metricsService.httpErrorCounter.inc({ method, route, status_code: statusCode });
      }
    });
    next();
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
