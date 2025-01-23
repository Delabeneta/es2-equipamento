import { Test, TestingModule } from '@nestjs/testing';
import { TrancaRepository } from './domain/tranca.repository';
import { TrancasService } from './trancas.service';
import { Tranca, TrancaStatus } from './domain/tranca';
import { TrancaEntity } from './domain/tranca.entity';
import { TotemRepository } from 'src/totens/domain/totem.repository';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';
import { BicicletaRepository } from 'src/bicicletas/domain/bicicleta.repository';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import { StatusAcaoReparador } from './dto/retirar-tranca.dto';
import { BicicletaStatus } from 'src/bicicletas/domain/bicicleta';
import { ExternoService } from 'src/common/utils/externo.service';

const mockExternoService = {
  sendEmail: jest.fn(),
};

describe('TrancaService', () => {
  let mockEntity: TrancaEntity;
  let mockDomain: Tranca;
  let mockTotem: any;
  let mockBicicleta: any;

  let service: TrancasService;
  let trancaRepository: TrancaRepository;
  let totemRepository: TotemRepository;
  let bicicletaRepository: BicicletaRepository;

  beforeEach(async () => {
    mockEntity = {
      id: 1,
      numero: 12,
      status: TrancaStatus.NOVA,
      modelo: 'teste',
      anoDeFabricacao: '2012',
      bicicleta: null,
      totem: null,
      totemId: 1,
      bicicletaId: 1,
      funcionarioId: 2,
      logsInsercao: null,
    };
    mockDomain = TrancaEntity.toDomain(mockEntity);
    mockTotem = { id: 1, nome: 'Totem 1' };
    mockBicicleta = {
      id: 1,
      marca: 'marcaBike',
      modelo: 'Elon Musk',
      ano: '2012',
      numero: 1234,
      status: BicicletaStatus.NOVA,
      tranca: null,
      trancaId: 1,
      funcionarioId: 2,
      logsInsercao: null,
    };
    trancaRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      saveLogInsercao: jest.fn(),
    };
    totemRepository = {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findTrancasByTotemId: jest.fn(),
      findBicicletasByTotemId: jest.fn(),
    };
    bicicletaRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      saveLogInsercao: jest.fn(),
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
        { provide: 'BicicletaRepository', useValue: bicicletaRepository },
        { provide: ExternoService, useValue: mockExternoService },
      ],
    }).compile();

    service = module.get<TrancasService>(TrancasService);
    trancaRepository = module.get<TrancaRepository>('TrancaRepository');
    totemRepository = module.get<TotemRepository>('TotemRepository');
  });

  // **************************
  ///   TESTES_MÉTODOS_CRUD
  // **************************
  describe('create', () => {
    it('should create a new tranca', async () => {
      jest.spyOn(trancaRepository, 'create').mockResolvedValue(mockEntity);
      await expect(
        service.create({
          anoDeFabricacao: mockEntity.anoDeFabricacao,
          modelo: mockEntity.modelo,
        }),
      ).resolves.toStrictEqual(mockDomain);
    });
  });
  it('should delete the tranca', async () => {
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    await expect(service.delete(mockEntity.id)).resolves.toBeUndefined();
    expect(trancaRepository.findById).toHaveBeenCalled();
  });

  it('should not delete when tranca not found', async () => {
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(null);
    await expect(service.delete(mockEntity.id)).rejects.toThrow(
      'Tranca nao encontrada',
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
  describe('findAll', () => {
    it('should return all trancas', async () => {
      jest.spyOn(trancaRepository, 'findAll').mockResolvedValue([mockEntity]);
      await expect(service.findAll()).resolves.toStrictEqual([mockDomain]);
      expect(trancaRepository.findAll).toHaveBeenCalled();
    });
  });
  describe('findById', () => {
    it('should return one tranca if it exists', async () => {
      jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
      await expect(service.findById(1)).resolves.toStrictEqual(mockDomain);
      expect(trancaRepository.findById).toHaveBeenNthCalledWith(1, 1);
    });
    it('should throw error when tranca not found', async () => {
      jest.spyOn(trancaRepository, 'findById').mockResolvedValue(null);
      await expect(service.findById(mockEntity.id)).rejects.toThrow(
        new AppError('Tranca nao encontrada', AppErrorType.RESOURCE_NOT_FOUND),
      );
      expect(trancaRepository.findById).toHaveBeenCalled();
    });
  });
  describe('update', () => {
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
        'Tranca nao encontrada',
      );
      expect(trancaRepository.findById).toHaveBeenCalled();
    });
  });

  describe('incluirNoTotem', () => {
    it('should include tranca in totem when conditions are okay', async () => {
      const incluirTrancaDto: IncluirTrancaDto = {
        idTranca: 1,
        idTotem: 1,
        idFuncionario: 0,
      };

      jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
      jest.spyOn(totemRepository, 'findById').mockResolvedValue(mockTotem);
      jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);

      await expect(service.incluirNoTotem(incluirTrancaDto)).resolves.toBe(
        'tranca foi incluída com sucesso',
      );
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
        'Tranca nao encontrada',
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
        'Ação nao permitida',
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
        'Totem nao encontrado',
      );
    });
  });
  describe('retirarDoTotem', () => {
    it('should retirar tranca for aposentadoria when valid', async () => {
      mockEntity.status = TrancaStatus.REPARO_SOLICITADO;
      jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
      jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);

      await service.retirarDoTotem({
        idTranca: 1,
        idFuncionario: 2,
        idTotem: 1,
        statusAcaoReparador: StatusAcaoReparador.APOSENTADORIA,
      });

      expect(trancaRepository.update).toHaveBeenCalledWith(1, {
        status: TrancaStatus.APOSENTADA,
        totem: null,
      });
      expect(mockExternoService.sendEmail).toHaveBeenCalledWith(
        'supervisor@equipamento.com',
        'Retirada da Tranca',
        'A tranca de número 1 foi retirada para APOSENTADORIA',
      );
    });
  });

  it('should retirar tranca from the network if valida and opcao = REPARO', async () => {
    mockEntity.status = TrancaStatus.REPARO_SOLICITADO;
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);
    jest.spyOn(mockExternoService, 'sendEmail').mockResolvedValue(mockEntity);

    await service.retirarDoTotem({
      idTranca: 1,
      idFuncionario: 2,
      idTotem: 1,
      statusAcaoReparador: StatusAcaoReparador.EM_REPARO,
    });

    expect(trancaRepository.update).toHaveBeenCalledWith(1, {
      status: TrancaStatus.EM_REPARO,
      totem: null,
    });
  });

  it('should throw error if tranca not found', async () => {
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(null);
    await expect(service.findById(mockEntity.id)).rejects.toThrow(
      new AppError('Tranca nao encontrada', AppErrorType.RESOURCE_NOT_FOUND),
    );
    expect(trancaRepository.findById).toHaveBeenCalledWith(mockEntity.id);
  });

  it('should throw error if tranca status is invalid for retirada', async () => {
    mockEntity.status = TrancaStatus.OCUPADA;
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);

    await expect(
      service.retirarDoTotem({
        idTranca: 1,
        idFuncionario: 2,
        idTotem: 1,
        statusAcaoReparador: StatusAcaoReparador.APOSENTADORIA,
      }),
    ).rejects.toThrow('Tranca está com status inválido para retirar do totem');
  });
  it('should throw error if invalid option is provided for statusAcaoReparador', async () => {
    mockEntity.status = TrancaStatus.REPARO_SOLICITADO;
    jest.spyOn(trancaRepository, 'findById').mockResolvedValue(mockEntity);
    await expect(
      service.retirarDoTotem({
        idTranca: 1,
        idFuncionario: 2,
        idTotem: 1,
        statusAcaoReparador: 'INVALID_STATUS' as any, // Aqui você coloca um valor inválido
      }),
    ).rejects.toThrow('Opcao invalida para retirada da tranca');
  });

  describe('trancar', () => {
    it('should trancar a tranca when conditions are valid', async () => {
      // Certifique-se de que a tranca tenha um status válido
      mockEntity.status = TrancaStatus.NOVA; // Ou TrancaStatus.EM_REPARO
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);
      jest.spyOn(service, 'validarBicicleta').mockResolvedValue(mockBicicleta);
      jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);
      jest
        .spyOn(bicicletaRepository, 'update')
        .mockResolvedValue(mockBicicleta);

      await expect(
        service.trancar({ idTranca: 1, idBicicleta: 1 }),
      ).resolves.toBeUndefined();

      expect(service.validarTranca).toHaveBeenCalledWith(1);
      expect(service.validarBicicleta).toHaveBeenCalledWith(1);
      expect(bicicletaRepository.update).toHaveBeenCalledWith(1, {
        status: BicicletaStatus.DISPONIVEL,
      });
      expect(trancaRepository.update).toHaveBeenCalledWith(1, {
        status: TrancaStatus.OCUPADA,
        bicicleta: { id: 1 },
      });
    });

    it('should throw an error if tranca status is invalid', async () => {
      // Defina a tranca com status inválido para testar o erro
      mockEntity.status = TrancaStatus.OCUPADA; // Ou qualquer status inválido
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);

      await expect(
        service.trancar({ idTranca: 1, idBicicleta: 1 }),
      ).rejects.toThrow(
        new AppError(
          'A tranca está com status inválido para ser trancada',
          AppErrorType.RESOURCE_CONFLICT,
        ),
      );

      expect(service.validarTranca).toHaveBeenCalledWith(1);
      expect(trancaRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if bicicleta is invalid', async () => {
      // A tranca está ocupada, mas a bicicleta não está válida
      mockEntity.status = TrancaStatus.NOVA;
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);
      jest
        .spyOn(service, 'validarBicicleta')
        .mockRejectedValue(
          new AppError(
            'Bicicleta nao encontrada',
            AppErrorType.RESOURCE_CONFLICT,
          ),
        );

      await expect(
        service.trancar({ idTranca: 1, idBicicleta: 1 }),
      ).rejects.toThrow('Bicicleta nao encontrada');

      expect(service.validarTranca).toHaveBeenCalledWith(1);
      expect(service.validarBicicleta).toHaveBeenCalledWith(1);
      expect(trancaRepository.update).not.toHaveBeenCalled();
    });
    it('should trancar without associating bicicleta if idBicicleta is not provided', async () => {
      mockEntity.status = TrancaStatus.NOVA; // Ou TrancaStatus.EM_REPARO
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);
      jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);

      await expect(service.trancar({ idTranca: 1 })).resolves.toBeUndefined();

      expect(service.validarTranca).toHaveBeenCalledWith(1);
      expect(trancaRepository.update).toHaveBeenCalledWith(1, {
        status: TrancaStatus.OCUPADA,
        bicicleta: null, // Não associando bicicleta
      });
    });
  });

  describe('destrancar', () => {
    it('should destrancar a tranca when conditions are valid', async () => {
      mockEntity.status = TrancaStatus.OCUPADA; // Tranca ocupada
      mockBicicleta.status = BicicletaStatus.DISPONIVEL; // Bicicleta disponível
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);
      jest.spyOn(service, 'validarBicicleta').mockResolvedValue(mockBicicleta);
      jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);
      jest
        .spyOn(bicicletaRepository, 'update')
        .mockResolvedValue(mockBicicleta);

      await expect(
        service.destrancar({ idTranca: 1, idBicicleta: 1 }),
      ).resolves.toBeUndefined();

      expect(service.validarTranca).toHaveBeenCalledWith(1);
      expect(service.validarBicicleta).toHaveBeenCalledWith(1);
      expect(bicicletaRepository.update).toHaveBeenCalledWith(1, {
        status: BicicletaStatus.EM_USO,
      });
      expect(trancaRepository.update).toHaveBeenCalledWith(1, {
        status: TrancaStatus.LIVRE,
        bicicleta: null,
      });
    });
    it('should destrancar without bicicleta if idBicicleta is not provided', async () => {
      mockEntity.status = TrancaStatus.OCUPADA; // Tranca ocupada
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);
      jest.spyOn(trancaRepository, 'update').mockResolvedValue(mockEntity);

      // Chama o serviço sem o idBicicleta
      await expect(
        service.destrancar({ idTranca: 1 }),
      ).resolves.toBeUndefined();

      expect(trancaRepository.update).toHaveBeenCalledWith(1, {
        status: TrancaStatus.LIVRE,
        bicicleta: null,
      });
    });

    it('should throw an error if bicicleta is invalid', async () => {
      mockEntity.status = TrancaStatus.OCUPADA;
      mockBicicleta.status = BicicletaStatus.EM_USO; // Bicicleta não disponível
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);
      jest.spyOn(service, 'validarBicicleta').mockResolvedValue(mockBicicleta);

      await expect(
        service.destrancar({ idTranca: 1, idBicicleta: 1 }),
      ).rejects.toThrow(
        'A bicicleta não pode ser removida da tranca, pois não está disponível',
      );

      expect(service.validarTranca).toHaveBeenCalledWith(1);
      expect(service.validarBicicleta).toHaveBeenCalledWith(1);
      expect(trancaRepository.update).not.toHaveBeenCalled();
    });
    it('should throw an error if tranca is invalid', async () => {
      mockEntity.status = TrancaStatus.LIVRE;
      jest.spyOn(service, 'validarTranca').mockResolvedValue(mockEntity);

      await expect(
        service.destrancar({ idTranca: 1, idBicicleta: 1 }),
      ).rejects.toThrow(
        'A tranca nao está ocupada e nao pode ser destrancada.',
      );

      expect(service.validarTranca).toHaveBeenCalledWith(1);
      expect(trancaRepository.update).not.toHaveBeenCalled();
    });
  });
  describe('ActionToTrancaStatus', () => {
    it('should return the correct status for a valid action', () => {
      const validActions = {
        LIVRE: TrancaStatus.LIVRE,
        OCUPADA: TrancaStatus.OCUPADA,
        EM_REPARO: TrancaStatus.EM_REPARO,
        APOSENTAR: TrancaStatus.APOSENTADA,
        REPARO_SOLICITADO: TrancaStatus.REPARO_SOLICITADO,
      };

      for (const [acao, statusEsperado] of Object.entries(validActions)) {
        const result = service.ActionToTrancaStatus(acao);
        expect(result).toBe(statusEsperado);
      }
    });

    it('should throw an error for an invalid action', () => {
      const invalidAction = 'INVALID_ACTION';

      expect(() => service.ActionToTrancaStatus(invalidAction)).toThrow(
        'Ação de status inválida',
      );
    });
  });
  describe('validarBicicleta', () => {
    it('should return the bicicleta if it exists', async () => {
      const idBicicleta = 1;
      const mockBicicleta = {
        id: 1,
        marca: 'marcaBike',
        modelo: 'Elon Musk',
        ano: '2012',
        numero: 1234,
        status: BicicletaStatus.NOVA,
        tranca: null,
        trancaId: 1,
        funcionarioId: 2,
        logsInsercao: null,
      };

      jest
        .spyOn(bicicletaRepository, 'findById')
        .mockResolvedValue(mockBicicleta);

      const result = await service.validarBicicleta(idBicicleta);

      expect(bicicletaRepository.findById).toHaveBeenCalledWith(idBicicleta);
      expect(result).toEqual(mockBicicleta);
    });

    it('should throw an error if the bicicleta does not exist', async () => {
      const idBicicleta = 1;

      jest.spyOn(bicicletaRepository, 'findById').mockResolvedValue(null);

      await expect(service.validarBicicleta(idBicicleta)).rejects.toThrow(
        'Bicicleta nao encontrada',
      );

      expect(bicicletaRepository.findById).toHaveBeenCalledWith(idBicicleta);
    });
  });
});
