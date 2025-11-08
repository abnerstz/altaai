import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY não configurada. Emails não serão enviados.');
    }
  }

  async sendInviteEmail(data: {
    to: string;
    companyName: string;
    senderName: string;
    role: string;
    token: string;
    expiresAt: Date;
  }) {
    if (!this.resend) {
      this.logger.warn('Resend não configurado. Email não enviado para: ' + data.to);
      return;
    }

    try {
      const acceptUrl = `${this.frontendUrl}/accept-invite/${data.token}`;
      const expiresAtFormatted = new Date(data.expiresAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const html = this.getInviteEmailTemplate({
        companyName: data.companyName,
        senderName: data.senderName,
        role: data.role,
        acceptUrl,
        expiresAt: expiresAtFormatted,
      });

      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Convite para se juntar a ${data.companyName}`,
        html,
      });

      this.logger.log(`Email de convite enviado para: ${data.to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${data.to}:`, error);
      throw error;
    }
  }

  private getInviteEmailTemplate(data: {
    companyName: string;
    senderName: string;
    role: string;
    acceptUrl: string;
    expiresAt: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para ${data.companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Você foi convidado!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá,
              </p>
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                <strong>${data.senderName}</strong> convidou você para se juntar à empresa <strong>${data.companyName}</strong> como <strong>${data.role}</strong>.
              </p>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Clique no botão abaixo para aceitar o convite e começar a colaborar:
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.acceptUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0 0; color: #999999; font-size: 12px; line-height: 1.6; text-align: center;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${data.acceptUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">${data.acceptUrl}</a>
              </p>
              <p style="margin: 30px 0 0 0; color: #999999; font-size: 12px; line-height: 1.6; text-align: center;">
                Este convite expira em <strong>${data.expiresAt}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6; text-align: center;">
                Se você não esperava este convite, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
