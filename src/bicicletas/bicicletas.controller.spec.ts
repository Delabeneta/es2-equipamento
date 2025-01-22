import { Test, TestingModule } from '@nestjs/testing';
import { BicicletasController } from './bicicletas.controller';
import { BicicletasService } from './bicicletas.service';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { UpdateBicicletaDto } from './dto/update-bicicleta.dto';
import { IncludeBicicletaOnTrancaDto } from './dto/include-bicicleta-on-tranca.dto';
import {
  RetirarBicicletaDaTrancaDto,
  StatusAcaoReparador,
} from './dto/retirar-bicicleta-on-tranca';
import { BicicletaStatus } from './domain/bicicleta';
import { AppError, AppErrorType } from 'src/common/domain/app-error';

describe('BicicletasController', () => {
  let bicicletasController: BicicletasController;
  let bicicletasService: BicicletasService;

  const mockBicicletasService = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    changeStatus: jest.fn(),
    incluirBicicletaNaRede: jest.fn(),
    retirarBicicletaDaRede: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BicicletasController],
      providers: [
        {
          provide: BicicletasService,
          useValue: mockBicicletasService,
        },
      ],
    }).compile();

    bicicletasController =
      module.get<BicicletasController>(BicicletasController);
    bicicletasService = module.get<BicicletasService>(BicicletasService);
  });

  it('should be defined', () => {
    expect(bicicletasController).toBeDefined();
  });

  describe('create', () => {
    it('should call BicicletasService.create with correct data', async () => {
      const createBicicletaDto: CreateBicicletaDto = {
        modelo: 'Modelo A',
        ano: '2022',
        marca: 'test',
      };

      await bicicletasController.create(createBicicletaDto);

      expect(bicicletasService.create).toHaveBeenCalledWith(createBicicletaDto);
    });
  });

  describe('update', () => {
    it('should call BicicletasService.update with correct data', async () => {
      const updateBicicletaDto: UpdateBicicletaDto = { modelo: 'Modelo B' };
      const idBicicleta = 1;

      await bicicletasController.update(idBicicleta, updateBicicletaDto);

      expect(bicicletasService.update).toHaveBeenCalledWith(
        idBicicleta,
        updateBicicletaDto,
      );
    });
  });

  describe('findAll', () => {
    it('should call BicicletasService.findAll', async () => {
      await bicicletasController.findAll();

      expect(bicicletasService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should call BicicletasService.findById', async () => {
      const mockBicicleta = {
        id: 1,
        modelo: 'Modelo A',
        ano: '2022',
        numero: 123,
        status: BicicletaStatus.NOVA,
        marca: 'test',
      };

      jest
        .spyOn(bicicletasService, 'findById')
        .mockResolvedValue(mockBicicleta);

      const idBicicleta = 1;
      const result = await bicicletasController.findById(idBicicleta);

      expect(bicicletasService.findById).toHaveBeenCalledWith(idBicicleta);
      expect(result).toEqual(mockBicicleta);
    });

    it('should throw an error if bicicleta is not found', async () => {
      jest
        .spyOn(bicicletasService, 'findById')
        .mockRejectedValue(
          new AppError(
            'Bicicleta nao encontrada',
            AppErrorType.RESOURCE_NOT_FOUND,
          ),
        );

      await expect(bicicletasController.findById(1)).rejects.toThrow(
        'Bicicleta nao encontrada',
      );
      expect(bicicletasService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('delete', () => {
    it('should call BicicletasService.delete with correct id', async () => {
      const idBicicleta = 1;

      await bicicletasController.delete(idBicicleta);

      expect(bicicletasService.delete).toHaveBeenCalledWith(idBicicleta);
    });
  });

  describe('trocarStatus', () => {
    it('should call BicicletasService.changeStatus with correct data', async () => {
      const idBicicleta = 1;
      const acao = 'manutencao';

      await bicicletasController.trocarStatus(idBicicleta, acao);

      expect(bicicletasService.changeStatus).toHaveBeenCalledWith(
        idBicicleta,
        acao,
      );
    });
  });

  describe('integrarNaRede', () => {
    it('should call BicicletasService.incluirBicicletaNaRede with correct data', async () => {
      const includeBicicletaOnTrancaDto: IncludeBicicletaOnTrancaDto = {
        idBicicleta: 1,
        idTranca: 2,
        idFuncionario: 0,
      };

      await bicicletasController.integrarNaRede(includeBicicletaOnTrancaDto);

      expect(bicicletasService.incluirBicicletaNaRede).toHaveBeenCalledWith(
        includeBicicletaOnTrancaDto,
      );
    });
  });

  describe('retirarDaRede', () => {
    it('should call BicicletasService.retirarBicicletaDaRede with correct data', async () => {
      const retirarBicicletaDaTrancaDto: RetirarBicicletaDaTrancaDto = {
        idBicicleta: 1,
        idTranca: 2,
        idFuncionario: 0,
        statusAcaoReparador: StatusAcaoReparador.EM_REPARO,
      };

      await bicicletasController.retirarDaRede(retirarBicicletaDaTrancaDto);

      expect(bicicletasService.retirarBicicletaDaRede).toHaveBeenCalledWith(
        retirarBicicletaDaTrancaDto,
      );
    });
  });
});
