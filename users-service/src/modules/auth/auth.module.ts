/* eslint-disable @typescript-eslint/require-await */
import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { RegisterUserService } from './services/register-user.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { BasicLoginService } from './services/basic-login.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidateTokenService } from './services/validate-token.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [RegisterUserService, BasicLoginService, ValidateTokenService],
})
export class AuthModule {}
