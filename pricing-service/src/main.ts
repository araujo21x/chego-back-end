import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const configGRPC: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'pricing',
      protoPath: join(__dirname, '..', '..', 'proto', 'pricing.proto'),
      url: '0.0.0.0:50052',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        arrays: true,
        objects: true,
        includeDirs: [join(__dirname, '..', '..', 'proto')],
      },
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, configGRPC);

  await app.listen();
  console.log('Pricing microservice is running as gRPC microservice on port 50052');
}
bootstrap();
