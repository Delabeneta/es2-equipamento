import { validate } from 'class-validator';
import { IncludeBicicletaOnTrancaDto } from './include-bicicleta-on-tranca.dto';

describe('IncludeBicicletaOnTrancaDto', () => {
  let dto: IncludeBicicletaOnTrancaDto;

  beforeEach(() => {
    dto = new IncludeBicicletaOnTrancaDto();
  });

  it('should validate successfully when all fields are correct', async () => {
    dto.idTranca = 1;
    dto.idFuncionario = 2;
    dto.idBicicleta = 3;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if idTranca is not a number', async () => {
    (dto as any).idTranca = 'not-a-number';
    dto.idFuncionario = 2;
    dto.idBicicleta = 3;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('idTranca');
  });

  it('should fail validation if idFuncionario is not a number', async () => {
    dto.idTranca = 1;
    (dto as any).idFuncionario = 'not-a-number';
    dto.idBicicleta = 3;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('idFuncionario');
  });

  it('should fail validation if idBicicleta is not a number', async () => {
    dto.idTranca = 1;
    dto.idFuncionario = 2;
    (dto as any).idBicicleta = 'not-a-number';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('idBicicleta');
  });
});
