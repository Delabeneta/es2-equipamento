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
});
