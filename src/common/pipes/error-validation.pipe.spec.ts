import { ValidationError } from '@nestjs/common';
import CustomValidationPipe, {
  CustomValidationError,
} from './error-validation.pipe';

describe('CustomValidationPipe', () => {
  let pipe: any;

  beforeEach(async () => {
    pipe = CustomValidationPipe;
  });

  it('should return CustomValidationError with errors array', async () => {
    const errors: ValidationError[] = [
      {
        property: 'name',
        constraints: {
          isNotEmpty: 'Name should not be empty',
        },
      },
    ];

    const result = pipe['exceptionFactory'](errors);

    expect(result).toBeInstanceOf(CustomValidationError);
    expect(result.errors).toEqual(errors);
  });

  it('should throw CustomValidationError if validation fails', async () => {
    const errors: ValidationError[] = [
      {
        property: 'name',
        constraints: {
          isNotEmpty: 'Name should not be empty',
        },
      },
    ];

    try {
      throw pipe['exceptionFactory'](errors);
    } catch (error) {
      expect(error).toBeInstanceOf(CustomValidationError);
      expect(error.errors).toEqual(errors);
    }
  });
});
