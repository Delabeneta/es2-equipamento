import { Injectable, Inject } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { AppError, AppErrorType } from '../domain/app-error'; // Certifique-se de ter o AppError implementado

@Injectable()
export class ExternoService {
  constructor(
    @Inject('ExternoMicrosserviceClient')
    private readonly cliente: AxiosInstance, // Cliente para fazer a requisição HTTP
  ) {}

  // Método para enviar o e-mail
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      // Faz a requisição POST para o microsserviço de envio de e-mail
      await this.cliente.post('/enviarEmail', {
        email: to, // Destinatário do e-mail
        assunto: subject, // Assunto do e-mail
        mensagem: body, // Corpo do e-mail
      });
      // Em caso de sucesso, não retorna nada (Promise<void>)
    } catch {
      // Se ocorrer um erro, lança um AppError
      throw new AppError(
        'Erro ao enviar e-mail',
        AppErrorType.RESOURCE_CONFLICT,
      );
    }
  }
}
