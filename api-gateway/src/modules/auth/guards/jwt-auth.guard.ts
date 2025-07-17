import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User, UserServiceClient } from 'src/shared/proto/users';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private userGrpcService: UserServiceClient;

  constructor(@Inject('USER_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userGrpcService = this.client.getService<UserServiceClient>('UserService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, unknown>; user?: User }>();
    const authHeader = typeof request.headers?.authorization === 'string' ? request.headers.authorization : undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido ou mal formatado.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const { user, message, isValid } = await lastValueFrom(this.userGrpcService.validateToken({ token }));

      if (!isValid) throw new UnauthorizedException(message);
      request.user = user;
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Erro ao validar token com Users Service:', msg);
      throw new UnauthorizedException(msg);
    }
  }
}
