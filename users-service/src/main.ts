import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const configGRPC: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '..', '..', 'proto', 'users.proto'),
      url: '0.0.0.0:50051',
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
  console.log('Users microservice is running as gRPC microservice on port 50051');
}
bootstrap();
