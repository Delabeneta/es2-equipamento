import { Test, TestingModule } from '@nestjs/testing';
import { TrancasService } from './trancas.service';
import { CreateTrancaDto } from './dto/create-tranca.dto';
import { UpdateTrancaDto } from './dto/update-tranca.dto';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';
import { TrancasController } from './trancas.controller';
import { TrancaEntity } from './domain/tranca.entity';
import { TrancaStatus } from './domain/tranca';
import { AppError, AppErrorType } from 'src/common/domain/app-error';
import {
  RetirarTrancaDto,
  StatusAcaoReparador,
} from './dto/retirar-tranca.dto';
import { TrancamentoTrancaDto } from './dto/tracamento-tranca.dto';

describe('TrancasController', () => {
  let trancasController: TrancasController;
  let trancasService: TrancasService;

  const mockTrancaService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    incluirNoTotem: jest.fn(),
    retirarDoTotem: jest.fn(),
    trancar: jest.fn(),
    destrancar: jest.fn(),
    changeStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrancasController],
      providers: [
        {
          provide: TrancasService,
          useValue: mockTrancaService,
        },
      ],
    }).compile();

    trancasController = module.get<TrancasController>(TrancasController);
    trancasService = module.get<TrancasService>(TrancasService);
  });

  it('should be defined', () => {
    expect(trancasController).toBeDefined();
  });

  describe('create', () => {
    it('should call TrancasService.create with correct data', async () => {
      const createTrancaDto: CreateTrancaDto = {
        modelo: 'Modelo A',
        anoDeFabricacao: '2022',
      };

      await trancasController.create(createTrancaDto);

      expect(trancasService.create).toHaveBeenCalledWith(createTrancaDto);
    });
  });

  describe('update', () => {
    it('should call TrancasService.update with correct data', async () => {
      const updateTrancaDto: UpdateTrancaDto = { modelo: 'Modelo B' };
      const idTranca = 1;

      await trancasController.update(idTranca, updateTrancaDto);

      expect(trancasService.update).toHaveBeenCalledWith(
        idTranca,
        updateTrancaDto,
      );
    });
  });

  describe('findAll', () => {
    it('should call TrancasService.findAll', async () => {
      await trancasController.findAll();

      expect(trancasService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return the tranca if it exists', async () => {
      const tranca = {
        id: 1,
        numero: 12,
        status: TrancaStatus.NOVA,
        modelo: 'teste',
        anoDeFabricacao: '2012',
        totemId: 1,
        bicicletaId: 1,
        funcionarioId: 2,
      } as TrancaEntity;

      trancasService.findById = jest.fn().mockResolvedValue(tranca);

      const result = await trancasController.findById(1);

      expect(trancasService.findById).toHaveBeenCalledWith(1);
      expect(result).toStrictEqual(tranca);
    });

    it('should throw an error if tranca does not exist', async () => {
      jest
        .spyOn(trancasService, 'findById')
        .mockRejectedValue(
          new AppError(
            'Tranca nao encontrada',
            AppErrorType.RESOURCE_NOT_FOUND,
          ),
        );

      await expect(trancasController.findById(1)).rejects.toThrow(
        'Tranca nao encontrada',
      );

      expect(trancasService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('delete', () => {
    it('should call TrancasService.delete with correct id', async () => {
      const idTranca = 1;

      await trancasController.delete(idTranca);

      expect(trancasService.delete).toHaveBeenCalledWith(idTranca);
    });
  });

  describe('inserirNoTotem', () => {
    it('should call TrancasService.incluirNoTotem with correct data', async () => {
      const incluirTrancaDto: IncluirTrancaDto = {
        idTranca: 1,
        idTotem: 2,
        idFuncionario: 3,
      };

      await trancasController.inserirNoTotem(incluirTrancaDto);

      expect(trancasService.incluirNoTotem).toHaveBeenCalledWith(
        incluirTrancaDto,
      );
    });
  });
  describe('retirarDaRede', () => {
    it('should call BicicletasService.retirarBicicletaDaRede with correct data', async () => {
      const retirarTrancaDto: RetirarTrancaDto = {
        idTotem: 1,
        idTranca: 2,
        idFuncionario: 0,
        statusAcaoReparador: StatusAcaoReparador.EM_REPARO,
      };

      await trancasController.retirarDaRede(retirarTrancaDto);

      expect(trancasService.retirarDoTotem).toHaveBeenCalledWith(
        retirarTrancaDto,
      );
    });
  });
  describe('trancar', () => {
    it('should call TrancasService.trancar with correct data', async () => {
      const tracamentoTrancaDto: TrancamentoTrancaDto = { bicicleta: 1 };
      const idTranca = 1;

      await trancasController.trancar(idTranca, tracamentoTrancaDto);

      expect(trancasService.trancar).toHaveBeenCalledWith({
        idTranca,
        ...tracamentoTrancaDto,
      });
    });
  });

  describe('destrancar', () => {
    it('should call TrancasService.destrancar with correct data', async () => {
      const tracamentoTrancaDto: TrancamentoTrancaDto = { bicicleta: 1 };
      const idTranca = 1;

      await trancasController.destrancar(idTranca, tracamentoTrancaDto);

      expect(trancasService.destrancar).toHaveBeenCalledWith({
        idTranca,
        idBicicleta: tracamentoTrancaDto.bicicleta,
      });
    });
  });

  describe('trocarStatus', () => {
    it('should call TrancasService.changeStatus with correct data', async () => {
      const idTranca = 1;
      const acao = 'OCUPADA';

      await trancasController.trocarStatus(idTranca, acao);

      expect(trancasService.changeStatus).toHaveBeenCalledWith(idTranca, acao);
    });
  });
});
