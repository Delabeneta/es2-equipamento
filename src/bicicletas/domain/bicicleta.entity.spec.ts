import { BicicletaStatus } from './bicicleta';
import { BicicletaEntity } from './bicicleta.entity';

describe('BicicletaEntity', () => {
  describe('toDomain', () => {
    it('should map a BicicletaEntity to a Bicicleta domain object ', () => {
      const bicicletaEntity = new BicicletaEntity();
      bicicletaEntity.id = 1;
      bicicletaEntity.ano = '2020';
      bicicletaEntity.marca = 'Monarc';
      bicicletaEntity.modelo = 'Modelo';
      bicicletaEntity.status = BicicletaStatus.DISPONIVEL;
      bicicletaEntity.numero = 123;

      const bicicletaDomain = BicicletaEntity.toDomain(bicicletaEntity);
      expect(bicicletaDomain.id).toBe(bicicletaEntity.id);
      expect(bicicletaDomain.ano).toBe(bicicletaEntity.ano);
      expect(bicicletaDomain.marca).toBe(bicicletaEntity.marca);
      expect(bicicletaDomain.modelo).toBe(bicicletaEntity.modelo);
      expect(bicicletaDomain.status).toBe(bicicletaEntity.status);
      expect(bicicletaDomain.numero).toBe(bicicletaEntity.numero);
    });
    it('should return null when the input is null', () => {
      const bicicletaEntity = null;
      const bicicletaDomain = BicicletaEntity.toDomain(bicicletaEntity);
      expect(bicicletaDomain).toBeNull();
    });
  });
});
