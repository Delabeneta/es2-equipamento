import { TotemEntity } from './totem.entity';

describe('TotemEntity', () => {
  describe('toDomain', () => {
    it('should map a TotemEntity to a Totem domain object', () => {
      const totemEntity = new TotemEntity();
      totemEntity.id = 1;
      totemEntity.localizacao = 'Centro da cidade';
      totemEntity.descricao = 'Totem próximo à praça central';
      const totemDomain = TotemEntity.toDomain(totemEntity);
      expect(totemDomain).not.toBeNull();
      expect(totemDomain.id).toBe(1);
      expect(totemDomain.localizacao).toBe('Centro da cidade');
      expect(totemDomain.descricao).toBe('Totem próximo à praça central');
    });

    it('should return null when the input is null', () => {
      const totemEntity = null;
      const totemDomain = TotemEntity.toDomain(totemEntity);
      expect(totemDomain).toBeNull();
    });
  });
});
