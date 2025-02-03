import { Not, Repository } from 'typeorm';
import { TypeormBicicletaRepository } from './typeorm-bicicleta.repository';
import { TypeormBicicletaEntity } from '../entities/typeorm-bicicleta.entity';
import { BicicletaStatus } from 'src/bicicletas/domain/bicicleta';

jest.mock('typeorm', () => {
  const actualTypeORM = jest.requireActual('typeorm');
  return {
    ...actualTypeORM,
    Not: jest.fn((value) => ({ _not: value })),
  };
});

describe('TypeormBicicletaRepository', () => {
  let repository: TypeormBicicletaRepository;
  let mockRepository: Repository<TypeormBicicletaEntity>;

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<TypeormBicicletaEntity>;
    repository = new TypeormBicicletaRepository(mockRepository);
  });

  describe('findById', () => {
    it('should find a bicicleta by id', async () => {
      const bicicleta = {
        id: 1,
        status: BicicletaStatus.NOVA,
      } as TypeormBicicletaEntity;
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(bicicleta);

      const result = await repository.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: bicicleta.id,
          status: Not(BicicletaStatus.EXCLUIDA),
        },
      });
      expect(result).toEqual(bicicleta);
    });

    it('should return null if bicicleta is not found', async () => {
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          status: Not(BicicletaStatus.EXCLUIDA),
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should mark a bicicleta as EXCLUIDA', async () => {
      await repository.delete(1);

      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        status: BicicletaStatus.EXCLUIDA,
      });
    });

    it('should throw an error if delete fails', async () => {
      jest
        .spyOn(mockRepository, 'update')
        .mockRejectedValue(new Error('Failed to update'));

      await expect(repository.delete(1)).rejects.toThrow('Failed to update');
    });
  });

  describe('findAll', () => {
    it('should return all bicicletas except those with status EXCLUIDA', async () => {
      const bicicletas = [
        { id: 1, status: BicicletaStatus.NOVA },
        { id: 2, status: BicicletaStatus.DISPONIVEL },
      ] as TypeormBicicletaEntity[];

      jest.spyOn(mockRepository, 'find').mockResolvedValue(bicicletas);
      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: expect.any(Object) },
      });
      expect(result).toEqual(bicicletas);
    });

    it('should return an empty array if no bicicletas are found', async () => {
      jest.spyOn(mockRepository, 'find').mockResolvedValue([]);

      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: expect.any(Object) },
      });
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a bicicleta and return the updated entity', async () => {
      const updatedData = { status: BicicletaStatus.EM_REPARO };
      const updatedBicicleta = {
        id: 1,
        status: BicicletaStatus.EM_REPARO,
      } as TypeormBicicletaEntity;

      jest.spyOn(mockRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(updatedBicicleta);

      const result = await repository.update(1, updatedData);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updatedData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          status: Not(BicicletaStatus.EXCLUIDA),
        },
      });
      expect(result).toEqual(updatedBicicleta);
    });

    it('should throw an error if update fails', async () => {
      jest
        .spyOn(mockRepository, 'update')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        repository.update(1, { status: BicicletaStatus.EM_REPARO }),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('findByNumero', () => {
    it('should find a bicicleta by numero', async () => {
      const bicicleta = {
        id: 1,
        status: BicicletaStatus.NOVA,
      } as TypeormBicicletaEntity;
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(bicicleta);

      const result = await repository.findByNumero(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          numero: 1,
          status: Not(BicicletaStatus.EXCLUIDA),
        },
      });
      expect(result).toEqual(bicicleta);
    });
  });

  describe('create', () => {
    it('should create and save a new bicicleta', async () => {
      const newBicicleta = {
        id: 1,
        status: BicicletaStatus.DISPONIVEL,
      } as TypeormBicicletaEntity;

      jest.spyOn(mockRepository, 'create').mockReturnValue(newBicicleta);
      jest.spyOn(mockRepository, 'save').mockResolvedValue(newBicicleta);

      const result = await repository.create(newBicicleta);

      expect(mockRepository.create).toHaveBeenCalledWith(newBicicleta);
      expect(mockRepository.save).toHaveBeenCalledWith(newBicicleta);
      expect(result).toEqual(newBicicleta);
    });

    it('should throw an error if create fails', async () => {
      jest
        .spyOn(mockRepository, 'save')
        .mockRejectedValue(new Error('Create failed'));

      const newBicicleta = {
        id: 1,
        status: BicicletaStatus.DISPONIVEL,
      } as TypeormBicicletaEntity;

      await expect(repository.create(newBicicleta)).rejects.toThrow(
        'Create failed',
      );
    });
  });
});
