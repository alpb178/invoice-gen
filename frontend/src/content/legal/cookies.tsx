import type { LegalDoc } from '@/components/LegalPage';
import type { Locale } from '@/i18n/config';

const es: LegalDoc = {
  title: 'Política de cookies',
  description:
    'Política de cookies de Invoice Generator: qué cookies usamos, con qué finalidad y cómo puedes gestionarlas.',
  updatedAt: '27 de mayo de 2026',
  summary:
    'Usamos cookies estrictamente necesarias para que el servicio funcione y, opcionalmente, cookies analíticas para entender cómo se usa la plataforma.',
  sections: [
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
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                  NEXT_LOCALE
                </td>
                <td className="py-3 pr-4 border-b border-ink-100">Técnica</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Recordar el idioma elegido.
                </td>
                <td className="py-3 border-b border-ink-100">Sesión</td>
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
  ],
};

const en: LegalDoc = {
  title: 'Cookie policy',
  description:
    'Invoice Generator cookie policy: which cookies we use, what for, and how you can manage them.',
  updatedAt: 'May 27, 2026',
  summary:
    'We use strictly necessary cookies to make the service work and, optionally, analytics cookies to understand how the platform is used.',
  sections: [
    {
      heading: '1. What are cookies?',
      body: (
        <p>
          Cookies are small text files stored on your device while you browse websites. They let
          a site remember information such as your session, preferences or activity, improving
          your experience.
        </p>
      ),
    },
    {
      heading: '2. Cookies we use',
      body: (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-ink-500 font-mono-tight">
                <th className="py-2 pr-4 border-b border-ink-200">Name</th>
                <th className="py-2 pr-4 border-b border-ink-200">Type</th>
                <th className="py-2 pr-4 border-b border-ink-200">Purpose</th>
                <th className="py-2 border-b border-ink-200">Duration</th>
              </tr>
            </thead>
            <tbody className="text-ink-700">
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                  session_token
                </td>
                <td className="py-3 pr-4 border-b border-ink-100">Technical</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Keep the user signed in.
                </td>
                <td className="py-3 border-b border-ink-100">Session</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                  active_team
                </td>
                <td className="py-3 pr-4 border-b border-ink-100">Technical</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Remember the selected active team.
                </td>
                <td className="py-3 border-b border-ink-100">1 year</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                  NEXT_LOCALE
                </td>
                <td className="py-3 pr-4 border-b border-ink-100">Technical</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Remember the chosen language.
                </td>
                <td className="py-3 border-b border-ink-100">Session</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">_ga</td>
                <td className="py-3 pr-4 border-b border-ink-100">Analytics</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Google Analytics — anonymized usage metrics.
                </td>
                <td className="py-3 border-b border-ink-100">2 years</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-xs">_ga_*</td>
                <td className="py-3 pr-4">Analytics</td>
                <td className="py-3 pr-4">
                  Google Analytics 4 — session state.
                </td>
                <td className="py-3">2 years</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      heading: '3. Third-party cookies',
      body: (
        <>
          <p>
            We use the following third-party tools, which set cookies on your device:
          </p>
          <ul>
            <li>
              <strong>Google Analytics 4</strong> — anonymized usage metrics. You can read
              its privacy policy{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                here
              </a>
              .
            </li>
            <li>
              <strong>Google Tag Manager</strong> — management of analytics and advertising
              tags.
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: '4. Managing your preferences',
      body: (
        <>
          <p>
            You can accept, reject or delete cookies at any time from your browser settings:
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
                href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/en-us/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          <p className="text-sm text-ink-600 mt-3">
            Keep in mind that disabling technical cookies may prevent the Service from working
            properly.
          </p>
        </>
      ),
    },
    {
      heading: '5. Updates',
      body: (
        <p>
          This policy may be updated to reflect changes in the cookies we use or in the
          regulations. We recommend reviewing it periodically.
        </p>
      ),
    },
  ],
};

const pt: LegalDoc = {
  title: 'Política de cookies',
  description:
    'Política de cookies do Invoice Generator: quais cookies usamos, para qual finalidade e como você pode gerenciá-los.',
  updatedAt: '27 de maio de 2026',
  summary:
    'Usamos cookies estritamente necessários para o funcionamento do serviço e, opcionalmente, cookies analíticos para entender como a plataforma é usada.',
  sections: [
    {
      heading: '1. O que são cookies?',
      body: (
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo enquanto você
          navega por sites. Eles permitem que o site lembre informações como a sua sessão,
          preferências ou atividade, melhorando a sua experiência de uso.
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
                <th className="py-2 pr-4 border-b border-ink-200">Nome</th>
                <th className="py-2 pr-4 border-b border-ink-200">Tipo</th>
                <th className="py-2 pr-4 border-b border-ink-200">Finalidade</th>
                <th className="py-2 border-b border-ink-200">Duração</th>
              </tr>
            </thead>
            <tbody className="text-ink-700">
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                  session_token
                </td>
                <td className="py-3 pr-4 border-b border-ink-100">Técnico</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Manter a sessão do usuário iniciada.
                </td>
                <td className="py-3 border-b border-ink-100">Sessão</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                  active_team
                </td>
                <td className="py-3 pr-4 border-b border-ink-100">Técnico</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Lembrar a equipe ativa selecionada.
                </td>
                <td className="py-3 border-b border-ink-100">1 ano</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">
                  NEXT_LOCALE
                </td>
                <td className="py-3 pr-4 border-b border-ink-100">Técnico</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Lembrar o idioma escolhido.
                </td>
                <td className="py-3 border-b border-ink-100">Sessão</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 border-b border-ink-100 font-mono text-xs">_ga</td>
                <td className="py-3 pr-4 border-b border-ink-100">Analítico</td>
                <td className="py-3 pr-4 border-b border-ink-100">
                  Google Analytics — métricas de uso anonimizadas.
                </td>
                <td className="py-3 border-b border-ink-100">2 anos</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-mono text-xs">_ga_*</td>
                <td className="py-3 pr-4">Analítico</td>
                <td className="py-3 pr-4">
                  Google Analytics 4 — estado da sessão.
                </td>
                <td className="py-3">2 anos</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      heading: '3. Cookies de terceiros',
      body: (
        <>
          <p>
            Utilizamos as seguintes ferramentas de terceiros, que instalam cookies no seu
            dispositivo:
          </p>
          <ul>
            <li>
              <strong>Google Analytics 4</strong> — métricas de uso anonimizadas. Você pode
              consultar a política de privacidade dele{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                aqui
              </a>
              .
            </li>
            <li>
              <strong>Google Tag Manager</strong> — gerenciamento de tags analíticas e de
              publicidade.
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: '4. Gerenciar as suas preferências',
      body: (
        <>
          <p>
            Você pode aceitar, recusar ou excluir cookies a qualquer momento nas
            configurações do seu navegador:
          </p>
          <ul>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647?hl=pt-BR"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/pt-BR/kb/enable-and-disable-cookies-website-preferences"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/pt-br/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink-950"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          <p className="text-sm text-ink-600 mt-3">
            Lembre-se de que desativar os cookies técnicos pode impedir o funcionamento
            correto do Serviço.
          </p>
        </>
      ),
    },
    {
      heading: '5. Atualizações',
      body: (
        <p>
          Esta política pode ser atualizada para refletir mudanças nos cookies que utilizamos
          ou mudanças na legislação. Recomendamos que você a revise periodicamente.
        </p>
      ),
    },
  ],
};

export const cookies: Record<Locale, LegalDoc> = { es, en, pt };
