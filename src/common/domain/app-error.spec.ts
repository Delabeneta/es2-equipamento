import { AppError, AppErrorType } from './app-error';

describe('AppError', () => {
  it('should create an AppError with correct message and type', () => {
    const message = 'Resource not found';
    const type = AppErrorType.RESOURCE_NOT_FOUND;

    const error = new AppError(message, type);

    expect(error.message).toBe(message);
    expect(error.type).toBe(type);
  });

  it('should create an AppError with RESOURCE_CONFLICT type', () => {
    const message = 'Resource conflict';
    const type = AppErrorType.RESOURCE_CONFLICT;

    const error = new AppError(message, type);

    expect(error.message).toBe(message);
    expect(error.type).toBe(type);
  });
});
