import { Repository } from 'typeorm';
import { TypeormTotemRepository } from './typeorm-totem.repository';
import { TypeormTotemEntity } from '../entities/typeorm-totem.entity';

jest.mock('typeorm', () => {
  const actualTypeORM = jest.requireActual('typeorm');
  return {
    ...actualTypeORM,
    Not: jest.fn((value) => ({ _not: value })),
  };
});

describe('TypeormTotemRepository', () => {
  let repository: TypeormTotemRepository;
  let mockRepository: Repository<TypeormTotemEntity>;

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<TypeormTotemEntity>;
    repository = new TypeormTotemRepository(mockRepository);
  });

  describe('findById', () => {
    it('should find a totem by id', async () => {
      const totem = {
        id: 1,
        descricao: '',
        localizacao: '',
        trancas: [],
      } as TypeormTotemEntity;
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(totem);

      const result = await repository.findById(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['trancas'],
      });
      expect(result).toEqual(totem);
    });
  });

  describe('delete', () => {
    it('should delete a totem by id', async () => {
      await repository.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return all totens', async () => {
      const totens = [
        { id: 1, descricao: '', localizacao: '', trancas: [] },
        { id: 2, descricao: '', localizacao: '', trancas: [] },
      ] as TypeormTotemEntity[];

      jest.spyOn(mockRepository, 'find').mockResolvedValue(totens);
      const result = await repository.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(totens);
    });
  });

  describe('create', () => {
    it('should create and save a new totem', async () => {
      const newTotem = {
        id: 1,
        descricao: '',
        localizacao: '',
        trancas: [],
      } as TypeormTotemEntity;

      jest.spyOn(mockRepository, 'save').mockResolvedValue(newTotem);

      const result = await repository.create(newTotem);

      expect(mockRepository.save).toHaveBeenCalledWith(newTotem);
      expect(result).toEqual(newTotem);
    });
  });
});
