import { Test, TestingModule } from '@nestjs/testing';
import { BicicletasService } from './bicicletas.service';
import { Bicicleta, BicicletaStatus } from './domain/bicicleta';
import { TrancaRepository } from 'src/trancas/domain/tranca.repository';
import { BicicletaRepository } from './domain/bicicleta.repository';
import { CreateBicicletaDto } from './dto/create-bicicleta.dto';
import { BicicletaEntity } from './domain/bicicleta.entity';
import { TrancaStatus } from 'src/trancas/domain/tranca';
import { EmailService } from 'src/common/utils/email.service';

const mockEmailService = {
  sendEmail: jest.fn(), // Simula o método sendEmail
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
        { provide: EmailService, useValue: mockEmailService },
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

  describe('update', () => {
    it('should throw an error if bicicleta does not exist', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);
      await expect(bicicletasService.update(1, null)).rejects.toThrow(
        'Bicicleta nao encontrada',
      );
    });

    it('should update if bicicleta exists', async () => {
      const bicicleta = {
        id: 1,
        ano: '2022',
        marca: 'caloi',
        modelo: 'bmx',
        status: BicicletaStatus.NOVA,
        funcionarioId: 0,
        trancaId: 0,
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
        funcionarioId: 0,
        trancaId: 0,
      } as BicicletaEntity;

      bicicletaRepository.findAll = jest.fn().mockResolvedValue([bicicleta]);

      const bicicletaDomain = BicicletaEntity.toDomain(bicicleta);
      const result = await bicicletasService.findAll();

      expect(bicicletaRepository.findAll).toHaveBeenCalled();
      expect(result).toStrictEqual([bicicletaDomain]);
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

      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow(
        'Bicicleta está com Status inválido para inserir no totem',
      );
    });

    it('should throw an error if bicicleta is in repair and funcionario cant include', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        status: BicicletaStatus.EM_REPARO,
        funcionarioId: 12,
      });

      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow('Ação nao permitida');
    });

    it('should throw an error if bicicleta is not found', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow('Bicicleta nao encontrada');
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
      ).rejects.toThrow('Tranca não encontrada');
    });

    it('should throw an error if tranca is not available', async () => {
      bicicletaRepository.findById = jest.fn().mockResolvedValue({
        id: 1,
        status: BicicletaStatus.NOVA,
      });
      trancaRepository.findById = jest
        .fn()
        .mockResolvedValue({ status: TrancaStatus.OCUPADA });

      await expect(
        bicicletasService.incluirBicicletaNaRede({
          idBicicleta: 1,
          idTranca: 1,
          idFuncionario: 123,
        }),
      ).rejects.toThrow('Tranca não está disponível');
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

      const result = await bicicletasService.changeStatus(1, 'APOSENTAR');
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

    it('should update the status to EM_USO when action is "EM_REPARO"', async () => {
      const mockBicicleta = { id: 2, status: BicicletaStatus.NOVA };
      bicicletaRepository.findById = jest.fn().mockResolvedValue(mockBicicleta);
      bicicletaRepository.update = jest.fn().mockResolvedValue({
        ...mockBicicleta,
        status: BicicletaStatus.EM_REPARO,
      });

      const result = await bicicletasService.changeStatus(2, 'EM_REPARO');
      expect(result.status).toBe(BicicletaStatus.EM_REPARO);
    });

    it('should update the status to DISPONIVEL when action is "disponivel"', async () => {
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
      ).rejects.toThrow('Bicicleta não encontrada');
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
