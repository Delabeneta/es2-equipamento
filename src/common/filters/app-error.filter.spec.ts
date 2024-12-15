import { Test, TestingModule } from '@nestjs/testing';
import { AppError, AppErrorType } from '../domain/app-error';
import { Response } from 'express';
import { AppErrorFilter } from './app-error.filter';

describe('AppErrorFilter', () => {
  let filter: AppErrorFilter;
  let response: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppErrorFilter],
    }).compile();

    filter = module.get<AppErrorFilter>(AppErrorFilter);
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
  });

  it('should return 404 for RESOURCE_NOT_FOUND error', () => {
    const exception = new AppError(
      'Resource not found',
      AppErrorType.RESOURCE_NOT_FOUND,
    );
    const host = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getResponse: jest.fn().mockReturnValue(response) }),
    };

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      codigo: '404',
      mensagem: 'Resource not found',
    });
  });

  it('should return 400 for RESOURCE_ERROR error', () => {
    const exception = new AppError(
      'Resource Error',
      AppErrorType.RESOURCE_ERROR,
    );
    const host = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getResponse: jest.fn().mockReturnValue(response) }),
    };

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      codigo: '400',
      mensagem: 'Resource Error',
    });
  });

  it('should return 409 for RESOURCE_CONFLICT error', () => {
    const exception = new AppError(
      'Resource conflict',
      AppErrorType.RESOURCE_CONFLICT,
    );
    const host = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getResponse: jest.fn().mockReturnValue(response) }),
    };

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      codigo: '409',
      mensagem: 'Resource conflict',
    });
  });

  it('should return 500 for unknown error types', () => {
    const exception = new AppError('Unknown error', null);
    const host = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getResponse: jest.fn().mockReturnValue(response) }),
    };

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      codigo: '500',
      mensagem: 'Unknown error',
    });
  });
});
