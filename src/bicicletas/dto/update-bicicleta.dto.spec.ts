import { validate } from 'class-validator';
import { UpdateBicicletaDto } from './update-bicicleta.dto';

describe('UpdateBicicletaDto', () => {
  it('should pass validation when all fields are valid', async () => {
    const dto = new UpdateBicicletaDto();
    dto.marca = 'Specialized';
    dto.modelo = 'Rockhopper';
    dto.ano = '2023';
    dto.funcionarioId = 123;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if "ano" is not a valid year', async () => {
    const dto = new UpdateBicicletaDto();
    dto.ano = '20AB';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty(
      'matches',
      'Ano deve ser um ano válido (YYYY).',
    );
  });

  it('should fail if "marca" is not a string', async () => {
    const dto = new UpdateBicicletaDto();
    dto.marca = 123 as any;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty(
      'isString',
      'marca must be a string',
    );
  });

  it('should fail if "funcionarioId" is not a number', async () => {
    const dto = new UpdateBicicletaDto();
    dto.funcionarioId = 'abc' as any;

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty(
      'isNumber',
      'funcionarioId must be a number conforming to the specified constraints',
    );
  });

  it('should pass validation if no fields are provided (optional fields)', async () => {
    const dto = new UpdateBicicletaDto();

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
