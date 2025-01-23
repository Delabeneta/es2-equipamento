import { Test, TestingModule } from '@nestjs/testing';
import { ExternoService } from './externo.service';
import { AxiosInstance } from 'axios';
import { AppError } from '../domain/app-error';

const mockAxiosInstance: Partial<AxiosInstance> = {
  post: jest.fn().mockResolvedValue({}),
};

describe('ExternoService', () => {
  let service: ExternoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternoService,
        {
          provide: 'ExternoMicrosserviceClient',
          useValue: mockAxiosInstance,
        },
      ],
    }).compile();

    service = module.get<ExternoService>(ExternoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('deve enviar um e-mail com sucesso', async () => {
      await expect(
        service.sendEmail('test@example.com', 'Subject', 'Body'),
      ).resolves.not.toThrow();

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/enviarEmail', {
        email: 'test@example.com',
        assunto: 'Subject',
        mensagem: 'Body',
      });
    });

    it('deve lançar um AppError em caso de falha no envio', async () => {
      jest
        .spyOn(mockAxiosInstance, 'post')
        .mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        service.sendEmail('test@example.com', 'Subject', 'Body'),
      ).rejects.toThrow(AppError);

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/enviarEmail', {
        email: 'test@example.com',
        assunto: 'Subject',
        mensagem: 'Body',
      });
    });
  });
});
