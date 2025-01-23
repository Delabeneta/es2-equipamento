import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ConfigService } from '@nestjs/config';
import { fetchSecrets } from './secrets';

jest.mock('@aws-sdk/client-secrets-manager');
jest.mock('@nestjs/config');

describe('fetchSecrets', () => {
  let mockSend: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    (SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: mockSend,
    }));

    mockGet = jest.fn();
    (ConfigService as jest.Mock).mockImplementation(() => ({
      get: mockGet,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and parse secrets correctly', async () => {
    const secretName = 'testSecret';
    const mockSecret = { username: 'testUser', password: 'testPass' };
    mockSend.mockResolvedValue({
      SecretString: JSON.stringify(mockSecret),
    });

    const result = await fetchSecrets(secretName);
    expect(result).toEqual(mockSecret);
  });
});
