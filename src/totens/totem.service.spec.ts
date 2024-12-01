import { Test, TestingModule } from '@nestjs/testing';
import { TotemRepository } from './domain/totem.repository';
import { TotemService } from './totem.service';

describe('TotemService', () => {
  const mockDto = {
    id: 1,
    localizacao: 'Pau-Grande',
    descricao: "Garricha'house",
  };

  let service: TotemService;
  let repository: TotemRepository;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TotemService,
        {
          provide: 'TotemRepository',
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TotemService>(TotemService);
    repository = module.get<TotemRepository>('TotemRepository');
  });

  it('should create a new totem', async () => {
    jest.spyOn(repository, 'create').mockResolvedValue(mockDto);
    await expect(
      service.create({
        localizacao: mockDto.localizacao,
        descricao: mockDto.descricao,
      }),
    ).resolves.toBe(mockDto);
  });

  it('should delete the totem', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(mockDto);
    await expect(service.delete(mockDto.id)).resolves.toBeUndefined();
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should not delete when totem not found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(service.delete(mockDto.id)).rejects.toThrow(
      'Totem não encontrada',
    );
    expect(repository.findById).toHaveBeenCalled();
  });

  it('should return all totens', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([mockDto]);
    await expect(service.findAll()).resolves.toStrictEqual([mockDto]);
    expect(repository.findAll).toHaveBeenCalled();
  });
});
