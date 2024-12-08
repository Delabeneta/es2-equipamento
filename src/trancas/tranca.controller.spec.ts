import { Test, TestingModule } from '@nestjs/testing';
import { TrancasService } from '../trancas/trancas.service';
import { CreateTrancaDto } from '../trancas/dto/create-tranca.dto';
import { UpdateTrancaDto } from '../trancas/dto/update-tranca.dto';
import { IncluirTrancaDto } from './dto/incluir-tranca.dto';
import { TrancasController } from './trancas.controller';

describe('TrancasController', () => {
  let trancasController: TrancasController;
  let trancasService: TrancasService;

  const mockTrancaService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
    incluirNoTotem: jest.fn(),
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
});
