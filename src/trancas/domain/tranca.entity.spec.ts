import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import { TrancaEntity } from './tranca.entity';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import { TotemEntity } from 'src/totens/domain/totem.entity';

describe('TrancaEntity', () => {
  describe('toDomain', () => {
    it('should map a TrancaEntity to a Tranca domain object', () => {
      const bicicleta = new BicicletaEntity();
      bicicleta.numero = 101;

      const totem = new TotemEntity();
      totem.localizacao = 'Parque Central';

      const trancaEntity = new TrancaEntity();
      trancaEntity.id = 1;
      trancaEntity.numero = 42;
      trancaEntity.status = TrancaStatus.LIVRE;
      trancaEntity.modelo = 'Modelo X';
      trancaEntity.anoDeFabricacao = '2022';
      trancaEntity.bicicleta = bicicleta;
      trancaEntity.totem = totem;

      const trancaDomain = TrancaEntity.toDomain(trancaEntity);

      expect(trancaDomain.id).toBe(1);
      expect(trancaDomain.numero).toBe(42);
      expect(trancaDomain.status).toBe(TrancaStatus.LIVRE);
      expect(trancaDomain.modelo).toBe('Modelo X');
      expect(trancaDomain.anoDeFabricacao).toBe('2022');
      expect(trancaDomain.bicicleta).toBe(101);
      expect(trancaDomain.localizacao).toBe('Parque Central');
    });

    it('should handle null bicicleta and totem correctly', () => {
      const trancaEntity = new TrancaEntity();
      trancaEntity.id = 2;
      trancaEntity.numero = 99;
      trancaEntity.status = TrancaStatus.APOSENTADA;
      trancaEntity.modelo = 'Modelo Y';
      trancaEntity.anoDeFabricacao = '2020';
      trancaEntity.bicicleta = null;
      trancaEntity.totem = null;

      const trancaDomain = TrancaEntity.toDomain(trancaEntity);

      expect(trancaDomain.id).toBe(2);
      expect(trancaDomain.numero).toBe(99);
      expect(trancaDomain.status).toBe(TrancaStatus.APOSENTADA);
      expect(trancaDomain.modelo).toBe('Modelo Y');
      expect(trancaDomain.anoDeFabricacao).toBe('2020');
      expect(trancaDomain.bicicleta).toBe(0);
      expect(trancaDomain.localizacao).toBe('');
    });
    it('should return null when the input is null', () => {
      const trancaEntity = null;
      const trancaDomain = TrancaEntity.toDomain(trancaEntity);
      expect(trancaDomain).toBeNull();
    });
  });
});
