import { Injectable, Inject } from '@nestjs/common';
import { AxiosInstance } from 'axios';

@Injectable()
export class ExternoService {
  constructor(
    @Inject('ExternoMicrosserviceClient')
    private readonly client: AxiosInstance,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!to || !subject || !body) {
      console.error('Email, assunto e mensagem são obrigatórios');
      return { success: false, message: 'Campos obrigatórios ausentes' };
    }

    const payload = { email: to, assunto: subject, mensagem: body };
    console.log('Payload enviado para o serviço de e-mail:', payload);

    try {
      const response = await this.client.post('/enviarEmail/', payload, {});
      console.log('E-mail enviado com sucesso:', response.data);
      return { success: true, message: 'E-mail enviado com sucesso' };
    } catch (error) {
      console.error(
        'Erro ao enviar e-mail:',
        error.response?.data || error.message,
      );
      console.error(
        'Detalhes do erro do microsserviço de e-mail:',
        error.response?.data || 'Nenhum detalhe fornecido',
      );
      return {
        success: true,
        message: 'Falha ao enviar e-mail, mas continuamos o fluxo',
      };
    }
  }
}
