import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { CustomValidationError } from '../pipes/error-validation.pipe';

@Catch(CustomValidationError)
export class CustomErrorValidationFilter implements ExceptionFilter {
  catch(exception: CustomValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errors = exception.errors;

    const customErrors = errors.map((item) => {
      return {
        codigo: 422,
        mensagem: Object.values(item.constraints)[0],
      };
    });

    response.status(422).json(customErrors);
  }
}
