import { ConfigService } from '@nestjs/config';
import { fetchSecrets } from '../@aws/secrets';
import credentialsConfig from './credentials.config';

jest.mock('@nestjs/config');
jest.mock('../@aws/secrets');

describe('credentialsConfig', () => {
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configServiceMock = new ConfigService() as jest.Mocked<ConfigService>;
    (ConfigService as jest.Mock).mockImplementation(() => configServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar segredos AWS quando NODE_ENV for aws-prod', async () => {
    configServiceMock.get.mockImplementation((key) => {
      const envMap = {
        NODE_ENV: 'aws-prod',
        AWS_SECRET_NAME: 'my-secret',
      };
      return envMap[key];
    });

    const mockSecrets = {
      ALUGUEL_SERVICE_URL: 'mock-auth',
      EXTERNO_SERVICE_URL: 'mock-url',
    };
    (fetchSecrets as jest.Mock).mockResolvedValue(mockSecrets);

    const result = await credentialsConfig();

    expect(result).toEqual({
      ALUGUEL_SERVICE_URL: 'mock-auth',
      EXTERNO_SERVICE_URL: 'mock-url',
    });
  });

  it('deve retornar configurações locais quando NODE_ENV não for aws-prod', async () => {
    configServiceMock.get.mockImplementation((key) => {
      const envMap = {
        NODE_ENV: 'local',
        ALUGUEL_SERVICE_URL: 'mock-auth',
        EXTERNO_SERVICE_URL: 'mock-url',
      };
      return envMap[key];
    });

    const result = await credentialsConfig();

    expect(fetchSecrets).not.toHaveBeenCalled();
    expect(result).toEqual({
      ALUGUEL_SERVICE_URL: 'mock-auth',
      EXTERNO_SERVICE_URL: 'mock-url',
    });
  });
});
