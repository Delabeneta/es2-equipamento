import { Test, TestingModule } from '@nestjs/testing';
import { TotemRepository } from './domain/totem.repository';
import { TotemService } from './totem.service';
import { Totem } from './domain/totem';
import { TotemEntity } from './domain/totem.entity';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import { BicicletaEntity } from 'src/bicicletas/domain/bicicleta.entity';
import { BicicletaStatus } from 'src/bicicletas/domain/bicicleta';
import { TrancaEntity } from 'src/trancas/domain/tranca.entity';

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
      'Totem nao encontrado',
    );
    expect(repository.findById).toHaveBeenCalled();
  });
  it('should throw error delete when totem has trancas', async () => {
    const mockEntity2 = {
      id: 1,
      localizacao: 'Fragoso',
      descricao: 'Posto 24h',
      trancas: [
        {
          id: 1,
          numero: 12,
          status: TrancaStatus.LIVRE,
          modelo: 'teste',
          anoDeFabricacao: '2012',
          bicicleta: null,
          totem: null,
          totemId: 0,
          bicicletaId: 0,
          funcionarioId: 0,
          logsInsercao: null,
        },
      ],
      bicicletas: [],
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity2);
    await expect(service.delete(mockEntity2.id)).rejects.toThrow(
      'Totem com trancas',
    );
    expect(repository.findById).toHaveBeenCalledWith(mockEntity2.id);
  });

  it('should return all totens', async () => {
    jest.spyOn(repository, 'findAll').mockResolvedValue([mockEntity]);
    await expect(service.findAll()).resolves.toStrictEqual([mockDomain]);
    expect(repository.findAll).toHaveBeenCalled();
  });

  ///
  // listar trancas:
  ///

  it('should return all trancas associated with a totem', async () => {
    const mockTotemData = {
      id: 1,
      localizacao: 'Fragoso',
      descricao: 'Posto 24h',
      trancas: [
        {
          id: 1,
          numero: 12,
          status: TrancaStatus.LIVRE,
          modelo: 'modelo-teste',
          anoDeFabricacao: '2012',
          bicicleta: null,
          totem: null,
          totemId: 0,
          bicicletaId: 0,
          funcionarioId: 0,
          logsInsercao: null,
        },
      ],
      bicicletas: [],
    };

    // Transformando trancas para o domínio
    const mockTransformedTrancas = mockTotemData.trancas.map((tranca) =>
      TrancaEntity.toDomain(tranca),
    );

    // Mock dos métodos do repositório
    jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
    jest
      .spyOn(repository, 'findTrancasByTotemId')
      .mockResolvedValue(mockTotemData.trancas);

    // Chamando o método do serviço
    const result = await service.listarTrancas(mockEntity.id);

    // Validando o resultado
    expect(result).toStrictEqual(mockTransformedTrancas);
    expect(repository.findById).toHaveBeenCalledWith(mockEntity.id);
    expect(repository.findTrancasByTotemId).toHaveBeenCalledWith(mockEntity.id);
  });

  /// erros listar trancas:
  ///
  it('should throw an error if no trancas are found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
    jest.spyOn(repository, 'findTrancasByTotemId').mockResolvedValue([]); // Nenhuma tranca encontrada

    await expect(service.listarTrancas(mockEntity.id)).rejects.toThrowError(
      new AppError(
        'Nenhuma tranca encontrada para este totem',
        AppErrorType.RESOURCE_NOT_FOUND,
      ),
    );
  });
  it('should throw an error if no totem are found', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(service.listarTrancas(mockEntity.id)).rejects.toThrow(
      new AppError('Totem nao encontrado', AppErrorType.RESOURCE_NOT_FOUND),
    );
    expect(repository.findById).toHaveBeenCalled();
  });
  ////
  //// lista bicicletas
  /////
  describe('lista bicicletas', () => {
    it('should return all bicicletas associated with a totem', async () => {
      const mockBicicletas = {
        id: 1,
        localizacao: 'Fragoso',
        descricao: 'Posto 24h',
        trancas: [
          {
            id: 1,
            numero: 12,
            status: TrancaStatus.LIVRE,
            modelo: 'teste',
            anoDeFabricacao: '2012',
            bicicleta: null,
            totem: null,
            totemId: 0,
            bicicletaId: 0,
            funcionarioId: 0,
            logsInsercao: null,
          },
        ],
        bicicletas: [
          {
            id: 1,
            numero: 12343,
            status: BicicletaStatus.DISPONIVEL,
            modelo: 'teste',
            ano: '2012',
            tranca: null,
            totem: null,
            totemId: 0,
            marca: 'marca',
            trancaId: 0,
            funcionarioId: 0,
            logsInsercao: null,
          },
        ],
      };

      // Transformando bicicletas para o domínio
      const mockTransformedBicicletas = mockBicicletas.bicicletas.map(
        (bicicleta) => BicicletaEntity.toDomain(bicicleta),
      );

      // Mock dos métodos do repositório
      jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
      jest
        .spyOn(repository, 'findBicicletasByTotemId')
        .mockResolvedValue(mockBicicletas.bicicletas);

      // Chamando o método do serviço
      const result = await service.listarBicicletas(mockEntity.id);

      // Validando o resultado
      expect(result).toStrictEqual(mockTransformedBicicletas);
      expect(repository.findById).toHaveBeenCalledWith(mockEntity.id);
      expect(repository.findBicicletasByTotemId).toHaveBeenCalledWith(
        mockEntity.id,
      );
    });

    it('should throw an error if no bicicletas are found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockEntity);
      jest.spyOn(repository, 'findBicicletasByTotemId').mockResolvedValue([]); // Nenhuma bicicleta encontrada

      await expect(
        service.listarBicicletas(mockEntity.id),
      ).rejects.toThrowError(
        new AppError(
          'Nenhuma bicicleta encontrada para este totem',
          AppErrorType.RESOURCE_NOT_FOUND,
        ),
      );
    });
    it('should throw an error if no totem is found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.listarBicicletas(123)).rejects.toThrow(
        new AppError('Totem nao encontrado', AppErrorType.RESOURCE_NOT_FOUND),
      );
    });
  });
});
