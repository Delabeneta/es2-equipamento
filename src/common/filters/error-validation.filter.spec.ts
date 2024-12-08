import { Test, TestingModule } from '@nestjs/testing';
import { CustomValidationError } from '../pipes/error-validation.pipe';
import { Response } from 'express';
import { CustomErrorValidationFilter } from './error-validation.filter';

describe('CustomErrorValidationFilter', () => {
  let filter: CustomErrorValidationFilter;
  let response: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomErrorValidationFilter],
    }).compile();

    filter = module.get<CustomErrorValidationFilter>(
      CustomErrorValidationFilter,
    );
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
  });

  it('should return 422 with formatted errors for CustomValidationError', () => {
    const errors = [
      {
        constraints: {
          isNotEmpty: 'Name should not be empty',
        },
      },
      {
        constraints: {
          isInt: 'Age must be a number',
        },
      },
    ];
    const exception = new CustomValidationError(errors as any[]);
    const host = {
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getResponse: jest.fn().mockReturnValue(response) }),
    };

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith([
      { codigo: 422, mensagem: 'Name should not be empty' },
      { codigo: 422, mensagem: 'Age must be a number' },
    ]);
  });
});
