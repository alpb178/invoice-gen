import type { Core } from '@strapi/strapi';

// Email delivery configuration.
// If SMTP_HOST is set we use nodemailer. Otherwise we fall back to the default
// provider (sendmail) so Strapi does not fail — the controllers catch errors
// and show the acceptUrl so it can be copied by hand.
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
          // If SMTP_FROM is not set, SMTP_USER itself is used as the sender
          // (handy for Gmail, Outlook, etc.).
          defaultFrom: env('SMTP_FROM') || env('SMTP_USER', 'no-reply@example.com'),
          defaultReplyTo: env('SMTP_REPLY_TO') || env('SMTP_FROM') || env('SMTP_USER', 'no-reply@example.com'),
        },
      },
    },
  };
};

export default config;
