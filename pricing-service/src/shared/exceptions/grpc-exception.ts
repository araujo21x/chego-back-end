import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

export function throwGrpcError(code: GrpcStatus, message: string): never {
  throw new RpcException({ code, message });
}

// Funções auxiliares específicas para clareza
export function throwUnauthenticated(message: string = 'Não autenticado'): never {
  throwGrpcError(GrpcStatus.UNAUTHENTICATED, message);
}

export function throwInvalidArgument(message: string = 'Argumentos inválidos'): never {
  throwGrpcError(GrpcStatus.INVALID_ARGUMENT, message);
}

export function throwAlreadyExists(message: string = 'Recurso já existe'): never {
  throwGrpcError(GrpcStatus.ALREADY_EXISTS, message);
}

export function throwNotFound(message: string = 'Recurso não encontrado'): never {
  throwGrpcError(GrpcStatus.NOT_FOUND, message);
}

export function throwPermissionDenied(message: string = 'Permissão negada'): never {
  throwGrpcError(GrpcStatus.PERMISSION_DENIED, message);
}

export function throwInternal(message: string = 'Erro interno do servidor'): never {
  throwGrpcError(GrpcStatus.INTERNAL, message);
}
