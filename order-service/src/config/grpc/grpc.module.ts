import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    GrpcModule,
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../proto/users.proto'),
          url: process.env.USER_SERVICE_URL || 'localhost:50051',
        },
      },
      {
        name: 'PRICING_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'pricing',
          protoPath: join(__dirname, '../../../proto/pricing.proto'),
          url: process.env.PRICING_SERVICE_URL || 'localhost:50052',
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcModule {}
