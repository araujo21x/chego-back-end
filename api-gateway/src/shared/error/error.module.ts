import { Module } from '@nestjs/common';
import { ErrorHandlerContext } from './error-handler.context';
import { DefaultErrorStrategy } from './strategies/default-error.strategy';
import { HttpErrorStrategy } from './strategies/http-error.strategy';
import { RpcErrorStrategy } from './strategies/rpc-error.strategy';

@Module({
  providers: [ErrorHandlerContext, DefaultErrorStrategy, HttpErrorStrategy, RpcErrorStrategy],
  exports: [ErrorHandlerContext, DefaultErrorStrategy, HttpErrorStrategy, RpcErrorStrategy],
})
export class ErrorModule {}
