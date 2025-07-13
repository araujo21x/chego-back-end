import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const configGRPC: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '../../proto/user.proto'),
      url: '0.0.0.0:50051',
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, configGRPC);

  await app.listen();
  console.log('Users microservice is running as gRPC microservice on port 50051');
}
bootstrap();
