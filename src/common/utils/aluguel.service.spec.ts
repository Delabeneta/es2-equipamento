import { Test, TestingModule } from '@nestjs/testing';
import { AluguelService } from './aluguel.service';
import { AxiosInstance } from 'axios';
import Funcionario, { FuncionarioFuncao } from '../domain/funcionario';

describe('AluguelService', () => {
  let aluguelService: AluguelService;
  let axiosInstanceMock: jest.Mocked<AxiosInstance>;

  beforeEach(async () => {
    axiosInstanceMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AluguelService,
        {
          provide: 'AluguelMicrosserviceClient',
          useValue: axiosInstanceMock,
        },
      ],
    }).compile();

    aluguelService = module.get<AluguelService>(AluguelService);
  });

  it('should return a funcionario when the API call is successful', async () => {
    const mockFuncionario: Funcionario = {
      matricula: '4534',
      nome: 'João Silva',
      idade: 12,
      email: 'reparador@equipamento.com',
      cpf: 'teste',
      funcao: FuncionarioFuncao.ADMINISTRADOR,
    };

    axiosInstanceMock.get.mockResolvedValueOnce({ data: mockFuncionario });

    const result = await aluguelService.getFuncionarioById(1);

    expect(result).toEqual(mockFuncionario);
    expect(axiosInstanceMock.get).toHaveBeenCalledWith('/funcionario/1');
  });

  it('should return null when the API call fails', async () => {
    axiosInstanceMock.get.mockRejectedValueOnce(new Error('API error'));

    const result = await aluguelService.getFuncionarioById(1);

    expect(result).toBeNull();
    expect(axiosInstanceMock.get).toHaveBeenCalledWith('/funcionario/1');
  });
});
