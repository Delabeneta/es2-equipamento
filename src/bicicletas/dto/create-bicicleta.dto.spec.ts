import { validate } from 'class-validator';
import { CreateBicicletaDto } from './create-bicicleta.dto';

describe('CreateBicicletaDto', () => {
  let dto: CreateBicicletaDto;

  beforeEach(() => {
    dto = new CreateBicicletaDto();
  });

  it('should validate successfully when all fields are correct', async () => {
    dto.marca = 'Caloi';
    dto.modelo = 'Elite';
    dto.ano = '2022';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if marca is not a string', async () => {
    (dto as any).marca = 123;
    dto.modelo = 'Elite';
    dto.ano = '2022';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('marca');
  });

  it('should fail validation if modelo is not a string', async () => {
    dto.marca = 'Caloi';
    (dto as any).modelo = 456;
    dto.ano = '2022';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('modelo');
  });

  it('should fail validation if ano is not a string matching YYYY format', async () => {
    dto.marca = 'Caloi';
    dto.modelo = 'Elite';
    dto.ano = '22'; // Invalid year format

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('ano');
    expect(errors[0].constraints?.matches).toBe(
      'Ano deve ser um ano válido (YYYY).',
    );
  });

  it('should fail validation if ano is not a string', async () => {
    dto.marca = 'Caloi';
    dto.modelo = 'Elite';
    (dto as any).ano = 2022; // Invalid type

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('ano');
  });
});
