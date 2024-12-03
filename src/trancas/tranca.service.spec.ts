import { Test, TestingModule } from '@nestjs/testing';
import { TrancaRepository } from './domain/tranca.repository';
import { TrancasService } from './trancas.service';
import { Tranca, TrancaStatus } from './domain/tranca';
import { TrancaEntity } from './domain/tranca.entity';

describe('TrancaService', () => {
  let mockEntity: TrancaEntity;
  let mockDomain: Tranca;

  let service: TrancasService;
  let repository: TrancaRepository;

  beforeEach(async () => {
    mockEntity = {
      id: 1,
      numero: 12,
      status: TrancaStatus.NOVA,
      modelo: 'teste',
      anoDeFabricacao: '2012',
      bicicleta: null,
      totem: null,
      totemId: 0,
      bicicletaId: 0,
      funcionarioId: 0,
    };
    mockDomain = TrancaEntity.toDomain(mockEntity);
    repository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrancasService,
        {
          provide: 'TrancaRepository',
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TrancasService>(TrancasService);
    repository = module.get<TrancaRepository>('TrancaRepository');
  });

  it('should create a new tranca', async () => {
    jest.spyOn(repository, 'create').mockResolvedValue(mockEntity);
    await expect(
      service.create({
        anoDeFabricacao: mockEntity.anoDeFabricacao,
        modelo: mockEntity.modelo,
      }),
    ).resolves.toStrictEqual(mockDomain);
  });

  it('should delete the tranca', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
    await expect(service.delete(mockEntity.id)).resolves.toBeUndefined();
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should not delete when tranca not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(service.delete(mockEntity.id)).rejects.toThrow(
      'Tranca não encontrada',
    );
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should not delete when tranca occupied', async () => {
    mockEntity.status = TrancaStatus.OCUPADA;
    jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
    await expect(service.delete(mockEntity.id)).rejects.toThrow(
      'Apenas Trancas sem bicicletas podem ser excluídas',
    );
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should return all trancas', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([mockEntity]);
    await expect(service.findAll()).resolves.toStrictEqual([mockDomain]);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should update trancas', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
    mockEntity.modelo = 'bauduco';
    mockDomain.modelo = 'bauduco';
    jest.spyOn(repository, 'update').mockResolvedValue(mockEntity);
    await expect(
      service.update(mockEntity.id, mockEntity),
    ).resolves.toStrictEqual(mockDomain);
    expect(repository.findById).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalled();
  });

  it('should not update when tranca not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(service.update(mockEntity.id, mockEntity)).rejects.toThrow(
      'Tranca não encontrada',
    );
    expect(repository.findById).toHaveBeenCalled();
  });
});
