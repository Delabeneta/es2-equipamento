import { Test, TestingModule } from '@nestjs/testing';
import { TotemRepository } from './domain/totem.repository';
import { TotemService } from './totem.service';
import { Totem } from './domain/totem';
import { TotemEntity } from './domain/totem.entity';

describe('TotemService', () => {
  let mockEntity: TotemEntity;
  let mockDomain: Totem;

  let service: TotemService;
  let repository: TotemRepository;

  const mockTrancaRepository = {
    findById: jest.fn(),
    // Adicione outros métodos necessários
  };

  beforeEach(async () => {
    mockEntity = {
      id: 1,
      localizacao: 'Fragoso',
      descricao: 'Posto 24h',
      trancas: [],
      bicicletas: [],
    };

    mockDomain = TotemEntity.toDomain(mockEntity);

    repository = {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findTrancasByTotemId: jest.fn(),
      findBicicletasByTotemId: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TotemService,
        {
          provide: 'TotemRepository',
          useValue: repository,
        },
        TotemService,
        {
          provide: 'TrancaRepository',
          useValue: mockTrancaRepository,
        },
        {
          provide: 'BicicletaRepository',
          useValue: jest.fn(),
        },
      ],
    }).compile();

    service = module.get<TotemService>(TotemService);
    repository = module.get<TotemRepository>('TotemRepository');
  });

  it('should create a new totem', async () => {
    jest.spyOn(repository, 'create').mockResolvedValue(mockEntity);
    await expect(
      service.create({
        localizacao: mockEntity.localizacao,
        descricao: mockEntity.descricao,
      }),
    ).resolves.toStrictEqual(mockDomain);
  });

  it('should delete the totem', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
    await expect(service.delete(mockEntity.id)).resolves.toBeUndefined();
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should not delete when totem not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(service.delete(mockEntity.id)).rejects.toThrow(
      'Totem não encontrada',
    );
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should return all totens', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([mockEntity]);
    await expect(service.findAll()).resolves.toStrictEqual([mockDomain]);
    expect(repository.findAll).toHaveBeenCalled();
  });
});
