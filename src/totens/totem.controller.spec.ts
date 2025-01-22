import { Test, TestingModule } from '@nestjs/testing';
import { TotemController } from './totem.controller';
import { TotemService } from './totem.service';
import { CreateTotemDto } from './dto/create-totem.dto';

describe('TotemController', () => {
  let totemController: TotemController;
  let totemService: TotemService;

  const mockTotemService = {
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TotemController],
      providers: [
        {
          provide: TotemService,
          useValue: mockTotemService,
        },
      ],
    }).compile();

    totemController = module.get<TotemController>(TotemController);
    totemService = module.get<TotemService>(TotemService);
  });

  it('should be defined', () => {
    expect(totemController).toBeDefined();
  });

  describe('create', () => {
    it('should call TotemService.create with correct data', async () => {
      const createTotemDto: CreateTotemDto = {
        descricao: '',
        localizacao: 'Centro',
      };

      await totemController.create(createTotemDto);

      expect(totemService.create).toHaveBeenCalledWith(createTotemDto);
    });
  });

  describe('findAll', () => {
    it('should call TotemService.findAll', async () => {
      await totemController.findAll();
      expect(totemService.findAll).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call TotemService.delete with correct id', async () => {
      const idTotem = 1;

      await totemController.delete(idTotem);
      expect(totemService.delete).toHaveBeenCalledWith(idTotem);
    });
  });
  describe('getTrancasByTotem', () => {
    it('should call TotemService.listarTrancas with correct id', async () => {
      const idTotem = 1;
      const trancas = [{ id: 1, modelo: 'Tranca 1' }]; // Mock de trancas

      totemService.listarTrancas = jest.fn().mockResolvedValue(trancas);

      const result = await totemController.getTrancasByTotem(idTotem);

      expect(totemService.listarTrancas).toHaveBeenCalledWith(idTotem);
      expect(result).toEqual(trancas);
    });
  });

  describe('getBicicletasByTotem', () => {
    it('should call TotemService.listarBicicletas with correct id', async () => {
      const idTotem = 1;
      const bicicletas = [{ id: 1, modelo: 'Bicicleta 1' }]; // Mock de bicicletas

      totemService.listarBicicletas = jest.fn().mockResolvedValue(bicicletas);

      const result = await totemController.getBicicletasByTotem(idTotem);

      expect(totemService.listarBicicletas).toHaveBeenCalledWith(idTotem);
      expect(result).toEqual(bicicletas);
    });
  });
});
