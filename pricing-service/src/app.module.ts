import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, PricingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
