import { Repository } from 'typeorm';
import { TypeormTrancaRepository } from './typeorm-tranca.repository';
import { TypeormTrancaEntity } from '../entities/typeorm-tranca.entity';
import { TrancaStatus } from 'src/trancas/domain/tranca';

jest.mock('typeorm', () => {
  const actualTypeORM = jest.requireActual('typeorm');
  return {
    ...actualTypeORM,
    Not: jest.fn((value) => ({ _not: value })),
  };
});

describe('TypeormTrancaRepository', () => {
  let repository: TypeormTrancaRepository;
  let mockRepository: Repository<TypeormTrancaEntity>;

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<TypeormTrancaEntity>;
    repository = new TypeormTrancaRepository(mockRepository);
  });

  describe('findById', () => {
    it('should find a tranca by id with relations', async () => {
      const tranca = {
        id: 1,
        status: TrancaStatus.EM_REPARO,
        totem: null,
        bicicleta: null,
        anoDeFabricacao: '',
        bicicletaId: 0,
        funcionarioId: 0,
        modelo: 'test',
        numero: 0,
        totemId: 0,
      } as TypeormTrancaEntity;

      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(tranca);

      const result = await repository.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { totem: true, bicicleta: true },
      });
      expect(result).toEqual(tranca);
    });
  });

  describe('delete', () => {
    it('should mark a tranca as EXCLUIDA', async () => {
      await repository.delete(1);

      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        status: TrancaStatus.EXCLUIDA,
      });
    });
  });

  describe('findAll', () => {
    it('should return all trancas except those with status EXCLUIDA', async () => {
      const trancas = [
        {
          id: 1,
          status: TrancaStatus.LIVRE,
          totem: { id: 1 },
          bicicleta: { id: 2 },
        },
        {
          id: 2,
          status: TrancaStatus.NOVA,
          totem: { id: 2 },
          bicicleta: null,
        },
      ] as TypeormTrancaEntity[];

      jest.spyOn(mockRepository, 'find').mockResolvedValue(trancas);

      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: expect.any(Object) },
        relations: { totem: true, bicicleta: true },
      });
      expect(result).toEqual(trancas);
    });
  });

  describe('update', () => {
    it('should update a tranca and return the updated entity', async () => {
      const updatedData = { status: TrancaStatus.EM_REPARO };
      const updatedTranca = {
        id: 1,
        status: TrancaStatus.EM_REPARO,
        totem: { id: 1 },
        bicicleta: { id: 2 },
      } as TypeormTrancaEntity;

      jest.spyOn(mockRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(updatedTranca);

      const result = await repository.update(1, updatedData);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updatedData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { totem: true, bicicleta: true },
      });
      expect(result).toEqual(updatedTranca);
    });
  });

  describe('create', () => {
    it('should create and save a new tranca', async () => {
      const newTranca = {
        id: 1,
        status: TrancaStatus.NOVA,
        totem: { id: 1 },
        bicicleta: null,
      } as TypeormTrancaEntity;

      jest.spyOn(mockRepository, 'save').mockResolvedValue(newTranca);

      const result = await repository.create(newTranca);

      expect(mockRepository.save).toHaveBeenCalledWith(newTranca);
      expect(result).toEqual(newTranca);
    });
  });
});
