import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Invoice Generator — Facturas profesionales en PDF, sin fricción';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
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
            <span>Tus facturas,</span>
            <span>
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>finalmente</span>{' '}
              <span
                style={{
                  background: 'rgba(176,84,63,0.28)',
                  paddingLeft: 6,
                  paddingRight: 6,
                }}
              >
                a la altura
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
            Crea, personaliza y descarga facturas profesionales en PDF. Multi-equipo,
            multi-moneda y reportes — gratis para empezar.
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
          <span>invoicegen · es-ES</span>
          <span>Sin tarjeta · Setup 2 min</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
