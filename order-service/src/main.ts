import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { INestApplication } from '@nestjs/common';
import { MetricsService } from './config/monitoring/metrics/services/metrics.service';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GrpcMetricsInterceptor } from './config/monitoring/metrics/interceptors/grpc-metrics.interceptor';
import { join } from 'path';

async function bootstrap() {
  await bootstrapGRPC();
  await bootstrapHttp();
}
bootstrap();

async function bootstrapHttp() {
  const httpApp: INestApplication = await NestFactory.create(AppModule);
  httpApp.get(MetricsService);

  const metricsPort = process.env.METRICS_PORT || 9003;
  await httpApp.listen(metricsPort);
  console.log(`Order Service (Metrics HTTP) is running on port ${metricsPort}`);
}

async function bootstrapGRPC() {
  const configGRPC: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'order',
      protoPath: join(__dirname, '..', 'proto', 'order.proto'),
      url: '0.0.0.0:50053',
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
  console.log('Order microservice is running as gRPC microservice on port 50053');
}
