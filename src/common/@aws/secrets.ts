import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { fromInstanceMetadata } from '@aws-sdk/credential-providers';

export const fetchSecrets = async (secretName: string) => {
  const client = new SecretsManagerClient({
    region: 'us-east-1',
    credentials: fromInstanceMetadata(),
  });

  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );
  return JSON.parse(response.SecretString);
};
