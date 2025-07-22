import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { MetricsService } from './config/monitoring/metrics/services/metrics.service';
import { INestApplication } from '@nestjs/common';
import { GrpcMetricsInterceptor } from './config/monitoring/metrics/interceptors/grpc-metrics.interceptor';

async function bootstrap() {
  const configGRPC: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '..', 'proto', 'users.proto'),
      url: '0.0.0.0:50051',
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
  console.log('Users microservice is running as gRPC microservice on port 50051');

  const httpApp: INestApplication = await NestFactory.create(AppModule);
  httpApp.get(MetricsService);

  const metricsPort = process.env.METRICS_PORT || 9001;
  await httpApp.listen(metricsPort);
  console.log(`Users Service (Metrics HTTP) is running on port ${metricsPort}`);
}
bootstrap();
