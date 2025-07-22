import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { MetricsService } from './config/monitoring/metrics/services/metrics.service';
import { GrpcMetricsInterceptor } from './config/monitoring/metrics/interceptors/grpc-metrics.interceptor';

async function bootstrap() {
  const configGRPC: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'pricing',
      protoPath: join(__dirname, '..', 'proto', 'pricing.proto'),
      url: '0.0.0.0:50052',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        arrays: true,
        objects: true,
        includeDirs: [join(__dirname, '..', 'proto')],
      },
    },
  };

  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, configGRPC);
  grpcApp.useGlobalInterceptors(new GrpcMetricsInterceptor(grpcApp.get(MetricsService)));

  await grpcApp.listen();
  console.log('Pricing microservice is running as gRPC microservice on port 50052');

  const httpApp: INestApplication = await NestFactory.create(AppModule);

  httpApp.get(MetricsService);

  const metricsPort = process.env.METRICS_PORT || 9002;
  await httpApp.listen(metricsPort);
  console.log(`Pricing Service (Metrics HTTP) is running on port ${metricsPort}`);
}
bootstrap();
