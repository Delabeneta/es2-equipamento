import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AppError, AppErrorType } from '../domain/app-error';

@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    switch (exception.type) {
      case AppErrorType.RESOURCE_NOT_FOUND:
        status = 404;
        break;
      case AppErrorType.RESOURCE_CONFLICT:
        status = 409;
        break;
      case AppErrorType.RESOURCE_ERROR:
        status = 400;
        break;
    }

    response.status(status).json({
      codigo: String(status),
      mensagem: exception.message,
    });
  }
}
