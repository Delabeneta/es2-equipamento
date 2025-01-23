import { ConfigService } from '@nestjs/config';
import { fetchSecrets } from '../@aws/secrets';

export default async () => {
  const configService = new ConfigService();
  if (configService.get('NODE_ENV') === 'aws-prod') {
    const secretName = 'prod/es2-equipamento';
    const secrets = await fetchSecrets(secretName);

    return {
      ALUGUEL_SERVICE_URL: secrets.ALUGUEL_SERVICE_URL,
      EXTERNO_SERVICE_URL: secrets.EXTERNO_SERVICE_URL,
    };
  }

  return {
    EXTERNO_SERVICE_URL: configService.get('EXTERNO_SERVICE_URL'),
    ALUGUEL_SERVICE_URL: configService.get('ALUGUEL_SERVICE_URL'),
  };
};
