import { TypeormTotemEntity } from './typeorm-totem.entity';

describe('TypeormTotemEntity', () => {
  it('should create an instance of TypeormTotemEntity', () => {
    const totem = new TypeormTotemEntity();
    expect(totem).toBeDefined();
  });

  it('should have default properties', () => {
    const totem = new TypeormTotemEntity();
    expect(totem.localizacao).toBeUndefined();
  });
});
