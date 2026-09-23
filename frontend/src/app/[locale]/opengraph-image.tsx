import { ImageResponse } from 'next/og';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';

export const runtime = 'edge';

const size = { width: 1200, height: 630 };

// Rendered at the edge outside the next-intl request, so the copy lives here.
const COPY: Record<Locale, {
  alt: string;
  line1: string;
  italic: string;
  highlight: string;
  body: string;
  footerLeft: string;
  footerRight: string;
}> = {
  es: {
    alt: 'Invoice Generator — Facturas profesionales en PDF, sin fricción',
    line1: 'Tus facturas,',
    italic: 'finalmente',
    highlight: 'a la altura',
    body: 'Crea, personaliza y descarga facturas profesionales en PDF. Multi-equipo, multi-moneda y reportes — gratis para empezar.',
    footerLeft: 'invoicegen · es-ES',
    footerRight: 'Sin tarjeta · Setup 2 min',
  },
  en: {
    alt: 'Invoice Generator — Professional PDF invoices, without the friction',
    line1: 'Your invoices,',
    italic: 'finally',
    highlight: 'up to standard',
    body: 'Create, customize and download professional PDF invoices. Multi-team, multi-currency and reports — free to get started.',
    footerLeft: 'invoicegen · en-US',
    footerRight: 'No card · 2-min setup',
  },
};

const copyFor = (locale: string) => COPY[isLocale(locale) ? locale : defaultLocale];

export function generateImageMetadata({ params }: { params: { locale: string } }) {
  return [{ id: 'og', alt: copyFor(params.locale).alt, size, contentType: 'image/png' }];
}

export default async function OpengraphImage({ params }: { params: { locale: string } }) {
  const copy = copyFor(params.locale);
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#f5f1e8',
          padding: '72px 80px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          color: '#18181b',
        }}
      >
        {/* top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 18,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#52525b',
            fontFamily: 'monospace',
          }}
        >
          <span>Invoice · Generator</span>
          <span style={{ color: '#b0543f' }}>Ed. 2026</span>
        </div>

        {/* headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 104,
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              fontWeight: 500,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>{copy.line1}</span>
            <span>
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>{copy.italic}</span>{' '}
              <span
                style={{
                  background: 'rgba(176,84,63,0.28)',
                  paddingLeft: 6,
                  paddingRight: 6,
                }}
              >
                {copy.highlight}
              </span>
              .
            </span>
          </div>

          <div
            style={{
              marginTop: 32,
              fontSize: 28,
              color: '#3f3f46',
              maxWidth: 820,
              lineHeight: 1.35,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {copy.body}
          </div>
        </div>

        {/* footer line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 18,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#71717a',
            fontFamily: 'monospace',
            borderTop: '1px solid rgba(28,28,31,0.2)',
            paddingTop: 24,
          }}
        >
          <span>{copy.footerLeft}</span>
          <span>{copy.footerRight}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
