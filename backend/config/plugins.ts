import type { Core } from '@strapi/strapi';

// Configuración de envíos de email.
// Si hay SMTP_HOST en el entorno usamos nodemailer. Si no, caemos al provider
// por defecto (sendmail) para que Strapi no falle — los controladores capturan
// errores y muestran el acceptUrl para copiar a mano.
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const smtpHost = env('SMTP_HOST');

  if (!smtpHost) {
    return {};
  }

  return {
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: smtpHost,
          port: env.int('SMTP_PORT', 587),
          secure: env.bool('SMTP_SECURE', false),
          auth: {
            user: env('SMTP_USER'),
            pass: env('SMTP_PASS'),
          },
        },
        settings: {
          // Si SMTP_FROM no está definido, se usa el propio SMTP_USER como
          // remitente (útil para Gmail, Outlook, etc.).
          defaultFrom: env('SMTP_FROM') || env('SMTP_USER', 'no-reply@example.com'),
          defaultReplyTo: env('SMTP_REPLY_TO') || env('SMTP_FROM') || env('SMTP_USER', 'no-reply@example.com'),
        },
      },
    },
  };
};

export default config;
