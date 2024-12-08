import { Test, TestingModule } from '@nestjs/testing';
import { BicicletasService } from './bicicletas.service';
import { Bicicleta, BicicletaStatus } from './domain/bicicleta';
import { TrancaRepository } from 'src/trancas/domain/tranca.repository';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaEntity } from './domain/bicicleta.entity';

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
        ano: createBicicletaDto.ano,
        marca: createBicicletaDto.marca,
        modelo: createBicicletaDto.modelo,
        status: BicicletaStatus.NOVA,
      } as BicicletaEntity);

      const result = await bicicletasService.create(createBicicletaDto);

      expect(bicicletaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          modelo: 'Modelo A',
          ano: '2022',
          marca: 'Marca X',
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
      bicicletaRepository.findById = jest
        .fn()
        .mockResolvedValue({ status: BicicletaStatus.NOVA });

      await expect(bicicletasService.delete(1)).rejects.toThrow(
        'Apenas Bicicletas aposentadas podem ser excluidas',
      );
    });

    it('should throw an error if bicicleta does not exist', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(bicicletasService.delete(1)).rejects.toThrow(
        'Bicicleta nao encontrada',
      );
    });
  });
});
