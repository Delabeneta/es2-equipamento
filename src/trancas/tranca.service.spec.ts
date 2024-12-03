import { Test, TestingModule } from '@nestjs/testing';
import { TrancaRepository } from './domain/tranca.repository';
import { TrancasService } from './trancas.service';
import { TrancaStatus } from './domain/tranca';
import { TotemEntity } from 'src/totens/domain/totem.entity';

describe('TrancaService', () => {
  const mockDto = {
    id: 1,
    bicicleta: 0,
    numero: 1423,
    modelo: 'Pau-Grande',
    anoDeFabricacao: '2024',
    localizacao: 'mage',
    status: TrancaStatus.NOVA,
    totem: null as TotemEntity | null, // Adicionar totem e outros campos necessários
    totemId: null as number | null,
    bicicletaId: null as number | null,
    funcionarioId: null as number | null,
  };

  let service: TrancasService;
  let repository: TrancaRepository;

  beforeEach(async () => {
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
    jest.spyOn(repository, 'create').mockResolvedValue(mockDto);
    await expect(
      service.create({
        anoDeFabricacao: mockDto.anoDeFabricacao,
        modelo: mockDto.modelo,
      }),
    ).resolves.toBe(mockDto);
  });

  it('should delete the tranca', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(mockDto);
    await expect(service.delete(mockDto.id)).resolves.toBeUndefined();
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should not delete when tranca not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(service.delete(mockDto.id)).rejects.toThrow(
      'Tranca não encontrada',
    );
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should not delete when tranca occupied', async () => {
    mockDto.status = TrancaStatus.OCUPADA;
    jest.spyOn(repository, 'findById').mockResolvedValue(mockDto);
    await expect(service.delete(mockDto.id)).rejects.toThrow(
      'Apenas Trancas sem bicicletas podem ser excluídas',
    );
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should return all trancas', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([mockDto]);
    await expect(service.findAll()).resolves.toStrictEqual([mockDto]);
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('should update trancas', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(mockDto);
    mockDto.modelo = 'test';
    jest.spyOn(repository, 'update').mockResolvedValue(mockDto);
    await expect(service.update(mockDto.id, mockDto)).resolves.toStrictEqual(
      mockDto,
    );
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should not update when tranca not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(service.update(mockDto.id, mockDto)).rejects.toThrow(
      'Tranca não encontrada',
    );
    expect(repository.findById).toHaveBeenCalled();
  });
});
