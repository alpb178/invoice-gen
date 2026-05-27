import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description:
    'Política de cookies de Invoice Generator: qué cookies usamos, con qué finalidad y cómo puedes gestionarlas.',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="§ Legal"
      title="Política de cookies"
      updatedAt="27 de mayo de 2026"
      summary="Usamos cookies estrictamente necesarias para que el servicio funcione y, opcionalmente, cookies analíticas para entender cómo se usa la plataforma."
      sections={[
        {
          heading: '1. ¿Qué son las cookies?',
          body: (
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo al
              navegar por sitios web. Permiten que la web recuerde información como tu sesión,
              preferencias o actividad, mejorando tu experiencia de uso.
            </p>
          ),
        },
        {
          heading: '2. Cookies que utilizamos',
          body: (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-ink-500 font-mono-tight">
                    <th className="py-2 pr-4 border-b border-ink-200">Nombre</th>
                    <th className="py-2 pr-4 border-b border-ink-200">Tipo</th>
                    <th className="py-2 pr-4 border-b border-ink-200">Finalidad</th>
                    <th className="py-2 border-b border-ink-200">Duración</th>
                  </tr>
                </thead>
                <tbody className="text-ink-700">
                  <tr>
                    <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                      session_token
                    </td>
                    <td className="py-3 pr-4 border-b border-ink-100">Técnica</td>
                    <td className="py-3 pr-4 border-b border-ink-100">
                      Mantener la sesión iniciada del usuario.
                    </td>
                    <td className="py-3 border-b border-ink-100">Sesión</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                      active_team
                    </td>
                    <td className="py-3 pr-4 border-b border-ink-100">Técnica</td>
                    <td className="py-3 pr-4 border-b border-ink-100">
                      Recordar el equipo activo seleccionado.
                    </td>
                    <td className="py-3 border-b border-ink-100">1 año</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">_ga</td>
                    <td className="py-3 pr-4 border-b border-ink-100">Analítica</td>
                    <td className="py-3 pr-4 border-b border-ink-100">
                      Google Analytics — métricas anonimizadas de uso.
                    </td>
                    <td className="py-3 border-b border-ink-100">2 años</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-xs">_ga_*</td>
                    <td className="py-3 pr-4">Analítica</td>
                    <td className="py-3 pr-4">
                      Google Analytics 4 — estado de la sesión.
                    </td>
                    <td className="py-3">2 años</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          heading: '3. Cookies de terceros',
          body: (
            <>
              <p>
                Utilizamos las siguientes herramientas de terceros que instalan cookies en tu
                dispositivo:
              </p>
              <ul>
                <li>
                  <strong>Google Analytics 4</strong> — métricas de uso anonimizadas. Puedes
                  consultar su política de privacidad{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink-950"
                  >
                    aquí
                  </a>
                  .
                </li>
                <li>
                  <strong>Google Tag Manager</strong> — gestión de etiquetas analíticas y
                  publicitarias.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: '4. Gestionar tus preferencias',
          body: (
            <>
              <p>
                Puedes aceptar, rechazar o eliminar cookies en cualquier momento desde la
                configuración de tu navegador:
              </p>
              <ul>
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink-950"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink-950"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink-950"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink-950"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
              <p className="text-sm text-ink-600 mt-3">
                Ten en cuenta que deshabilitar las cookies técnicas puede impedir el correcto
                funcionamiento del Servicio.
              </p>
            </>
          ),
        },
        {
          heading: '5. Actualizaciones',
          body: (
            <p>
              Esta política puede actualizarse para reflejar cambios en las cookies que utilizamos
              o cambios normativos. Te recomendamos revisarla periódicamente.
            </p>
          ),
        },
      ]}
    />
  );
}
