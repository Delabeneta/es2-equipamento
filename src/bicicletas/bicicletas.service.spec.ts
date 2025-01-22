import { Test, TestingModule } from '@nestjs/testing';
import { BicicletasService } from './bicicletas.service';
import { Bicicleta, BicicletaStatus } from './domain/bicicleta';
import { TrancaRepository } from 'src/trancas/domain/tranca.repository';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaEntity } from './domain/bicicleta.entity';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import { ExternoService } from 'src/common/utils/externo.service';
import { StatusAcaoReparador } from './dto/retirar-bicicleta-on-tranca';
import { AluguelService } from 'src/common/utils/aluguel.service';
import { FuncionarioFuncao } from 'src/common/domain/funcionario';

const mockExternoService = {
  sendEmail: jest.fn(),
};

const mockAluguelService = {
  getFuncionarioById: jest.fn(),
};

describe('BicicletasService', () => {
  let bicicletasService: BicicletasService;
  let bicicletaRepository: Partial<BicicletaRepository>;
  let trancaRepository: Partial<TrancaRepository>;

  beforeEach(async () => {
    bicicletaRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      saveLogInsercao: jest.fn(),
    };

    trancaRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BicicletasService,
        { provide: 'BicicletaRepository', useValue: bicicletaRepository },
        { provide: 'TrancaRepository', useValue: trancaRepository },
        { provide: ExternoService, useValue: mockExternoService },
        { provide: AluguelService, useValue: mockAluguelService },
      ],
    }).compile();

    bicicletasService = module.get<BicicletasService>(BicicletasService);
  });

  describe('create', () => {
    it('should create a new bicicleta', async () => {
      const createBicicletaDto: CreateBicicletaDto = {
        modelo: 'Modelo A',
        ano: '2022',
        marca: 'Marca X',
      };

      bicicletaRepository.create = jest.fn().mockResolvedValue({
        id: 1,
        ...createBicicletaDto,
        status: BicicletaStatus.NOVA,
      } as BicicletaEntity);

      const result = await bicicletasService.create(createBicicletaDto);

      expect(bicicletaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createBicicletaDto,
          status: BicicletaStatus.NOVA,
        }),
      );

      expect(result).toBeInstanceOf(Bicicleta);
      expect(result).toHaveProperty('id');
    });
  });

  describe('delete', () => {
    it('should delete a bicicleta if it is aposentada', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        status: BicicletaStatus.APOSENTADA,
      });
      bicicletaRepository.delete = jest.fn().mockResolvedValue(undefined);

      await bicicletasService.delete(1);

      expect(bicicletaRepository.findById).toHaveBeenCalledWith(1);
      expect(bicicletaRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if bicicleta is not aposentada', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        status: BicicletaStatus.NOVA,
      });

      await expect(bicicletasService.delete(1)).rejects.toThrow(
        'Apenas bicicletas aposentadas podem ser excluídas',
      );
    });

    it('should throw an error if bicicleta does not exist', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(bicicletasService.delete(1)).rejects.toThrow(
        'Bicicleta nao encontrada',
      );
    });
  });

  describe('update', () => {
    it('should throw an error if bicicleta does not exist', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(bicicletasService.update(1, null)).rejects.toThrow(
        'Bicicleta nao encontrada',
      );
    });

    it('should update bicicleta if it exists', async () => {
      const bicicleta = {
        id: 1,
        ano: '2022',
        marca: 'caloi',
        modelo: 'bmx',
        status: BicicletaStatus.NOVA,
      } as BicicletaEntity;

      const updated = {
        ano: '2021',
        marca: 'teste',
        modelo: 'teste',
      };

      bicicletaRepository.findById = jest.fn().mockResolvedValue(bicicleta);
      bicicletaRepository.update = jest.fn().mockResolvedValue({
        ...bicicleta,
        ...updated,
      });

      const result = await bicicletasService.update(1, updated);

      expect(result).toHaveProperty('ano', updated.ano);
      expect(result).toHaveProperty('modelo', updated.modelo);
      expect(result).toHaveProperty('marca', updated.marca);
    });
  });

  describe('findAll', () => {
    it('should return all bicicletas', async () => {
      const bicicleta = {
        id: 1,
        ano: '2022',
        marca: 'caloi',
        modelo: 'bmx',
        status: BicicletaStatus.NOVA,
      } as BicicletaEntity;

      bicicletaRepository.findAll = jest.fn().mockResolvedValue([bicicleta]);

      const bicicletaDomain = BicicletaEntity.toDomain(bicicleta);
      const result = await bicicletasService.findAll();

      expect(bicicletaRepository.findAll).toHaveBeenCalled();
      expect(result).toStrictEqual([bicicletaDomain]);
    });
  });

  describe('findById', () => {
    it('should return the bicicleta if it exists', async () => {
      const bicicleta = {
        id: 1,
        ano: '2022',
        marca: 'caloi',
        modelo: 'bmx',
        status: BicicletaStatus.NOVA,
      } as BicicletaEntity;

      bicicletaRepository.findById = jest.fn().mockResolvedValue(bicicleta);

      const bicicletaDomain = BicicletaEntity.toDomain(bicicleta);
      const result = await bicicletasService.findById(1);

      expect(bicicletaRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toStrictEqual(bicicletaDomain);
    });

    it('should throw an error if bicicleta does not exist', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(bicicletasService.findById(1)).rejects.toThrow(
        new AppError(
          'Bicicleta nao encontrada',
          AppErrorType.RESOURCE_NOT_FOUND,
        ),
      );
    });
  });

  describe('incluirBicicletaNaRede', () => {
    it('should include bicicleta in the network if valid', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.NOVA,
      });

      trancaRepository.findById = jest.fn().mockResolvedValue({
        status: TrancaStatus.LIVRE,
      });

      mockAluguelService.getFuncionarioById = jest.fn().mockResolvedValue({
        id: 123,
        matricula: '4534',
        nome: 'João Silva',
        idade: 12,
        email: 'reparador@equipamento.com',
        cpf: 'teste',
        funcao: FuncionarioFuncao.ADMINISTRADOR,
      });

      await bicicletasService.incluirBicicletaNaRede({
        idBicicleta: 1,
        idTranca: 1,
        idFuncionario: 123,
      });

      expect(bicicletaRepository.update).toHaveBeenCalledWith(1, {
        status: BicicletaStatus.DISPONIVEL,
      });

      expect(trancaRepository.update).toHaveBeenCalledWith(1, {
        status: TrancaStatus.OCUPADA,
        bicicleta: { id: 1 },
      });
    });

    it('should throw an error if bicicleta is not available', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        status: BicicletaStatus.DISPONIVEL,
      });

      // Esperando o erro de conflito
      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow(
        new AppError(
          'Bicicleta está com status inválido para inserir no totem',
          AppErrorType.RESOURCE_CONFLICT,
        ),
      );
    });

    it('should throw an error if bicicleta is in repair and funcionario cant include', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        status: BicicletaStatus.EM_REPARO,
        funcionarioId: 12,
      });

      // Esperando o erro se o funcionário não for o mesmo que retirou
      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow('Funcionário nao é o mesmo que a retirou');
    });

    it('should throw an error if bicicleta is not found', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      // Esperando o erro de "Bicicleta não encontrada"
      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow(
        new AppError(
          'Bicicleta nao encontrada',
          AppErrorType.RESOURCE_NOT_FOUND,
        ),
      );
    });

    it('should throw an error if tranca is not found', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        status: BicicletaStatus.NOVA,
      });
      trancaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow('Tranca nao encontrada');
    });

    it('should throw an error if tranca is not available', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.NOVA,
      });
      trancaRepository.findById = jest.fn().mockResolvedValue({
        status: TrancaStatus.OCUPADA,
      });

      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow('Tranca nao está disponível');
    });
    it('should throw an error if funcionario is not found', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.NOVA,
      });

      trancaRepository.findById = jest.fn().mockResolvedValue({
        status: TrancaStatus.LIVRE,
      });

      mockAluguelService.getFuncionarioById = jest.fn().mockResolvedValue(null);

      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 10,
        }),
      ).rejects.toThrow('Funcionario nao encontrado');
    });
  });

  /// funcao para retirar bicicleta da Rede

  describe('retirarBicicletaDaRede', () => {
    it('should retirar bicicleta from the network if valid and acaoStatusReparador = EM_Reparo', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.REPARO_SOLICITADO,
      });

      trancaRepository.findById = jest.fn().mockResolvedValue({
        id: 2,
        status: TrancaStatus.OCUPADA,
        bicicletaId: 1,
      });

      mockAluguelService.getFuncionarioById = jest.fn().mockResolvedValue({
        id: 123,
        matricula: '4534',
        nome: 'João Silva',
        idade: 12,
        email: 'reparador@equipamento.com',
        cpf: 'teste',
        funcao: FuncionarioFuncao.ADMINISTRADOR,
      });

      bicicletaRepository.update = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.EM_REPARO,
      });

      await bicicletasService.retirarBicicletaDaRede({
        idBicicleta: 1,
        idTranca: 2,
        idFuncionario: 123,
        statusAcaoReparador: StatusAcaoReparador.EM_REPARO,
      });

      expect(trancaRepository.update).toHaveBeenCalledWith(2, {
        status: TrancaStatus.LIVRE,
        bicicleta: null,
      });
      expect(bicicletaRepository.update).toHaveBeenCalledWith(1, {
        funcionarioId: 123,
        status: BicicletaStatus.EM_REPARO,
      });
      expect(bicicletaRepository.saveLogInsercao).toHaveBeenCalledWith(1, {
        dataHoraInsercao: expect.any(String),
        idTranca: 2,
      });

      expect(mockExternoService.sendEmail).toHaveBeenCalledWith(
        'reparador@equipamento.com',
        'Retirada de Bicicleta',
        'A bicicleta de número 1 foi retirada para EM_REPARO.',
      );
    });

    it('should retirar bicicleta from the network if valid and opcao = APOSENTADORIA', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.REPARO_SOLICITADO,
      });

      trancaRepository.findById = jest.fn().mockResolvedValue({
        id: 2,
        status: TrancaStatus.OCUPADA,
        bicicletaId: 1,
      });

      mockAluguelService.getFuncionarioById = jest.fn().mockResolvedValue({
        id: 123,
        matricula: '4534',
        nome: 'João Silva',
        idade: 12,
        email: 'reparador@equipamento.com',
        cpf: 'teste',
        funcao: FuncionarioFuncao.ADMINISTRADOR,
      });

      await bicicletasService.retirarBicicletaDaRede({
        idBicicleta: 1,
        idTranca: 2,
        idFuncionario: 123,
        statusAcaoReparador: StatusAcaoReparador.APOSENTADA,
      });

      expect(trancaRepository.update).toHaveBeenCalledWith(2, {
        status: TrancaStatus.LIVRE,
        bicicleta: null,
      });
      expect(bicicletaRepository.update).toHaveBeenCalledWith(1, {
        funcionarioId: 123,
        status: BicicletaStatus.APOSENTADA,
      });
      expect(bicicletaRepository.saveLogInsercao).toHaveBeenCalledWith(1, {
        dataHoraInsercao: expect.any(String),
        idTranca: 2,
      });
      expect(mockExternoService.sendEmail).toHaveBeenCalledWith(
        'reparador@equipamento.com',
        'Retirada de Bicicleta',
        'A bicicleta de número 1 foi retirada para APOSENTADA.',
      );
    });

    it('should throw an error if bicicleta is not found', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        bicicletasService.retirarBicicletaDaRede({
          idBicicleta: 1,
          idTranca: 2,
          idFuncionario: 123,
          statusAcaoReparador: StatusAcaoReparador.EM_REPARO,
        }),
      ).rejects.toThrow(
        new AppError(
          'Bicicleta nao encontrada',
          AppErrorType.RESOURCE_NOT_FOUND,
        ),
      );
    });

    it('should throw an error if tranca is not found', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.REPARO_SOLICITADO,
      });

      trancaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        bicicletasService.retirarBicicletaDaRede({
          idBicicleta: 1,
          idTranca: 2,
          idFuncionario: 123,
          statusAcaoReparador: StatusAcaoReparador.EM_REPARO,
        }),
      ).rejects.toThrow(
        new AppError('Tranca nao encontrada', AppErrorType.RESOURCE_NOT_FOUND),
      );
    });

    it('should throw an error if tranca status is not OCUPADA', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.REPARO_SOLICITADO,
      });

      trancaRepository.findById = jest.fn().mockResolvedValue({
        id: 2,
        status: TrancaStatus.LIVRE,
      });

      await expect(
        bicicletasService.retirarBicicletaDaRede({
          idBicicleta: 1,
          idTranca: 2,
          idFuncionario: 123,
          statusAcaoReparador: StatusAcaoReparador.EM_REPARO,
        }),
      ).rejects.toThrow(
        new AppError(
          'Tranca não está ocupada para retirar a bicicleta',
          AppErrorType.RESOURCE_CONFLICT,
        ),
      );
    });
    it('should throw an error if bicicleta status is not REPARO_SOLICITADO', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.EM_USO,
      });

      trancaRepository.findById = jest.fn().mockResolvedValue({
        id: 2,
        status: TrancaStatus.OCUPADA,
        bicicletaId: 1,
      });

      mockAluguelService.getFuncionarioById = jest.fn().mockResolvedValue({
        id: 123,
        matricula: '4534',
        nome: 'João Silva',
        idade: 12,
        email: 'reparador@equipamento.com',
        cpf: 'teste',
        funcao: FuncionarioFuncao.ADMINISTRADOR,
      });

      await expect(
        bicicletasService.retirarBicicletaDaRede({
          idBicicleta: 1,
          idTranca: 2,
          idFuncionario: 123,
          statusAcaoReparador: StatusAcaoReparador.APOSENTADA,
        }),
      ).rejects.toThrow('A bicicleta não está em estado de REPARO_SOLICITADO');
    });
  });

  describe('changeStatus', () => {
    it('should update the status to APOSENTADA when action is "APOSENTAR"', async () => {
      const mockBicicleta = { id: 1, status: BicicletaStatus.NOVA };
      bicicletaRepository.findById = jest.fn().mockResolvedValue(mockBicicleta);
      bicicletaRepository.update = jest.fn().mockResolvedValue({
        ...mockBicicleta,
        status: BicicletaStatus.APOSENTADA,
      });

      const result = await bicicletasService.changeStatus(1, 'APOSENTADA');
      expect(result.status).toBe(BicicletaStatus.APOSENTADA);
    });

    it('should update the status to EM_USO when action is "EM_USO"', async () => {
      const mockBicicleta = { id: 2, status: BicicletaStatus.NOVA };
      bicicletaRepository.findById = jest.fn().mockResolvedValue(mockBicicleta);
      bicicletaRepository.update = jest.fn().mockResolvedValue({
        ...mockBicicleta,
        status: BicicletaStatus.EM_USO,
      });

      const result = await bicicletasService.changeStatus(2, 'EM_USO');
      expect(result.status).toBe(BicicletaStatus.EM_USO);
    });

    it('should update the status to EM_REPARO when action is "EM_REPARO"', async () => {
      const mockBicicleta = { id: 2, status: BicicletaStatus.NOVA };
      bicicletaRepository.findById = jest.fn().mockResolvedValue(mockBicicleta);
      bicicletaRepository.update = jest.fn().mockResolvedValue({
        ...mockBicicleta,
        status: BicicletaStatus.EM_REPARO,
      });

      const result = await bicicletasService.changeStatus(2, 'EM_REPARO');
      expect(result.status).toBe(BicicletaStatus.EM_REPARO);
    });

    it('should update the status to DISPONIVEL when action is "DISPONIVEL"', async () => {
      const mockBicicleta = { id: 2, status: BicicletaStatus.NOVA };
      bicicletaRepository.findById = jest.fn().mockResolvedValue(mockBicicleta);
      bicicletaRepository.update = jest.fn().mockResolvedValue({
        ...mockBicicleta,
        status: BicicletaStatus.DISPONIVEL,
      });

      const result = await bicicletasService.changeStatus(2, 'DISPONIVEL');
      expect(result.status).toBe(BicicletaStatus.DISPONIVEL);
    });

    it('should throw an error when the bicicleta is not found', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        bicicletasService.changeStatus(1, 'APOSENTAR'),
      ).rejects.toThrow(
        new AppError(
          'Bicicleta nao encontrada',
          AppErrorType.RESOURCE_NOT_FOUND,
        ),
      );
    });

    it('should throw an error when the action is invalid', async () => {
      const mockBicicleta = { id: 3, status: BicicletaStatus.NOVA };
      bicicletaRepository.findById = jest.fn().mockResolvedValue(mockBicicleta);

      await expect(
        bicicletasService.changeStatus(3, 'invalid_action'),
      ).rejects.toThrow('Ação de status inválida');
    });
  });
});
