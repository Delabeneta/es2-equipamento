import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import Funcionario from '../domain/funcionario';

@Injectable()
export class AluguelService {
  constructor(
    @Inject('AluguelMicrosserviceClient')
    private readonly client: AxiosInstance,
  ) {}

  async getFuncionarioById(idFuncionario: number): Promise<Funcionario> {
    try {
      const response = await this.client.get('/funcionario/' + idFuncionario);
      return response.data;
    } catch {
      return null;
    }
  }
}
