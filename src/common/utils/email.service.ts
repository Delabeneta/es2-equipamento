import { Injectable } from '@nestjs/common';

@Injectable()
// Feito para simular um envio de e-mail
// Sempre retorna "sucesso"
export class EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<string> {
    if (!to || !subject || !body) {
      throw new Error('Todos os campos são obrigatórios.');
    }
    console.log(
      `Envio de email para: ${to},
       Assunto: ${subject},
       Corpo: ${body}`,
    );
    return 'sucesso';
  }
}
