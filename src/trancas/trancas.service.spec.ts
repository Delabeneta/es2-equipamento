import { Test, TestingModule } from '@nestjs/testing';
import { TrancaRepository } from './domain/tranca.repository';
import { TrancasService } from './trancas.service';
import { Tranca, TrancaStatus } from './domain/tranca';
import { TrancaEntity } from './domain/tranca.entity';
import { TotemRepository } from 'src/totens/domain/totem.repository';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';

describe('TrancaService', () => {
  let mockEntity: TrancaEntity;
  let mockDomain: Tranca;
  let mockTotem: any;

  let service: TrancasService;
  let trancaRepository: TrancaRepository;
  let totemRepository: TotemRepository;

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
    mockTotem = { id: 1, nome: 'Totem 1' };
    trancaRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };
    totemRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrancasService,
        {
          provide: 'TrancaRepository',
          useValue: trancaRepository,
        },
        {
          provide: 'TotemRepository',
          useValue: totemRepository,
        },
      ],
    }).compile();

    service = module.get<TrancasService>(TrancasService);
    trancaRepository = module.get<TrancaRepository>('TrancaRepository');
    totemRepository = module.get<TotemRepository>('TotemRepository');
  });

  it('should create a new tranca', async () => {
    jest.spyOn(trancaRepository, 'create').mockResolvedValue(mockEntity);
    await expect(
      service.create({
        anoDeFabricacao: mockEntity.anoDeFabricacao,
        modelo: mockEntity.modelo,
      }),
    ).resolves.toStrictEqual(mockDomain);
  });

  it('should delete the tranca', async () => {
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    await expect(service.delete(mockEntity.id)).resolves.toBeUndefined();
    expect(trancaRepository.findById).toHaveBeenCalled();
  });

  it('should not delete when tranca not found', async () => {
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(null);
    await expect(service.delete(mockEntity.id)).rejects.toThrow(
      'Tranca não encontrada',
    );
    expect(trancaRepository.findById).toHaveBeenCalled();
  });

  it('should not delete when tranca occupied', async () => {
    mockEntity.status = TrancaStatus.OCUPADA;
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    await expect(service.delete(mockEntity.id)).rejects.toThrow(
      'Apenas Trancas sem bicicletas podem ser excluídas',
    );
    expect(trancaRepository.findById).toHaveBeenCalled();
  });

  it('should return all trancas', async () => {
    jest.spyOn(trancaRepository, 'findAll').mockResolvedValue([mockEntity]);
    await expect(service.findAll()).resolves.toStrictEqual([mockDomain]);
    expect(trancaRepository.findAll).toHaveBeenCalled();
  });

  it('should update trancas', async () => {
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    mockEntity.modelo = 'bauduco';
    mockDomain.modelo = 'bauduco';
    jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);
    await expect(
      service.update(mockEntity.id, mockEntity),
    ).resolves.toStrictEqual(mockDomain);
    expect(trancaRepository.findById).toHaveBeenCalled();
    expect(trancaRepository.update).toHaveBeenCalled();
  });

  it('should not update when tranca not found', async () => {
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(null);
    await expect(service.update(mockEntity.id, mockEntity)).rejects.toThrow(
      'Tranca não encontrada',
    );
    expect(trancaRepository.findById).toHaveBeenCalled();
  });

  it('should include tranca in totem when conditions are met', async () => {
    const incluirTrancaDto: IncluirTrancaDto = {
      idTranca: 1,
      idTotem: 1,
      idFuncionario: 0,
    };

    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    jest.spyOn(totemRepository, 'findById').mockResolvedValue(mockTotem);
    jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);

    await expect(
      service.incluirNoTotem(incluirTrancaDto),
    ).resolves.toBeUndefined();
    expect(trancaRepository.findById).toHaveBeenCalledWith(1);
    expect(totemRepository.findById).toHaveBeenCalledWith(1);
    expect(trancaRepository.update).toHaveBeenCalledWith(1, {
      status: TrancaStatus.LIVRE,
      totem: { id: 1 },
    });
  });

  it('should throw error when tranca not found', async () => {
    const incluirTrancaDto: IncluirTrancaDto = {
      idTranca: 1,
      idTotem: 1,
      idFuncionario: 0,
    };

    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(null);

    await expect(service.incluirNoTotem(incluirTrancaDto)).rejects.toThrow(
      'Tranca não encontrada',
    );
  });

  it('should throw error when tranca has invalid status for totem inclusion', async () => {
    const incluirTrancaDto: IncluirTrancaDto = {
      idTranca: 1,
      idTotem: 1,
      idFuncionario: 0,
    };

    mockEntity.status = TrancaStatus.OCUPADA;
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);

    await expect(service.incluirNoTotem(incluirTrancaDto)).rejects.toThrow(
      'Tranca está com status inválido para inserir no totem',
    );
  });

  it('should throw error when tranca is in repair and funcionarioId does not match', async () => {
    const incluirTrancaDto: IncluirTrancaDto = {
      idTranca: 1,
      idTotem: 1,
      idFuncionario: 1,
    };

    mockEntity.status = TrancaStatus.EM_REPARO;
    mockEntity.funcionarioId = 0;
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);

    await expect(service.incluirNoTotem(incluirTrancaDto)).rejects.toThrow(
      'Ação não permitida',
    );
  });

  it('should throw error when totem not found', async () => {
    const incluirTrancaDto: IncluirTrancaDto = {
      idTranca: 1,
      idTotem: 1,
      idFuncionario: 0,
    };

    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    jest.spyOn(totemRepository, 'findById').mockResolvedValue(null);

    await expect(service.incluirNoTotem(incluirTrancaDto)).rejects.toThrow(
      'Totem não encontrado',
    );
  });
});
