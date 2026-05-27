import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Política de privacidad de Invoice Generator: qué datos recopilamos, con qué finalidad, durante cuánto tiempo y cuáles son tus derechos.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="§ Legal"
      title="Política de privacidad"
      updatedAt="27 de mayo de 2026"
      summary="Respetamos tu privacidad. Aquí explicamos qué datos tratamos, por qué y cómo puedes ejercer tus derechos."
      sections={[
        {
          heading: '1. Responsable del tratamiento',
          body: (
            <p>
              El responsable del tratamiento de tus datos personales es{' '}
              <strong>Invoice Generator</strong>, con dirección de contacto{' '}
              <a
                href="mailto:alesx2soporte@gmail.com"
                className="underline hover:text-ink-950"
              >
                alesx2soporte@gmail.com
              </a>
              .
            </p>
          ),
        },
        {
          heading: '2. Datos que tratamos',
          body: (
            <>
              <p>Tratamos las siguientes categorías de datos:</p>
              <ul>
                <li>
                  <strong>Datos de cuenta</strong>: correo electrónico y contraseña cifrada.
                </li>
                <li>
                  <strong>Datos de facturación</strong>: nombre de empresa, CIF/NIF, dirección
                  fiscal, clientes y conceptos de factura.
                </li>
                <li>
                  <strong>Datos técnicos</strong>: dirección IP, navegador, sistema operativo y
                  páginas visitadas, recopilados con fines analíticos y de seguridad.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: '3. Finalidad y base legal',
          body: (
            <>
              <p>Tratamos tus datos para:</p>
              <ul>
                <li>Prestar el Servicio y mantener tu cuenta operativa (ejecución contractual).</li>
                <li>Cumplir obligaciones fiscales y contables (obligación legal).</li>
                <li>
                  Mejorar el producto mediante analítica anonimizada y comunicaciones de servicio
                  (interés legítimo).
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: '4. Conservación',
          body: (
            <p>
              Conservamos tus datos mientras tu cuenta esté activa. Tras la cancelación, los datos
              de facturación se conservarán durante los plazos legales obligatorios (típicamente 6
              años en España) y los datos de cuenta serán eliminados o anonimizados en un plazo
              máximo de 30 días.
            </p>
          ),
        },
        {
          heading: '5. Destinatarios',
          body: (
            <>
              <p>
                No vendemos ni cedemos tus datos a terceros. Únicamente compartimos información
                con proveedores que prestan servicios técnicos esenciales:
              </p>
              <ul>
                <li>Proveedores de hosting y bases de datos.</li>
                <li>Servicios de analítica web y métricas de producto.</li>
                <li>Pasarelas de pago, en su caso.</li>
              </ul>
              <p>
                Todos los proveedores cumplen las garantías exigidas por el RGPD y han firmado
                contratos de encargo de tratamiento.
              </p>
            </>
          ),
        },
        {
          heading: '6. Tus derechos',
          body: (
            <>
              <p>Como titular de los datos, tienes derecho a:</p>
              <ul>
                <li>Acceder, rectificar y suprimir tus datos.</li>
                <li>Oponerte al tratamiento y solicitar la limitación.</li>
                <li>Solicitar la portabilidad de los datos.</li>
                <li>Retirar el consentimiento prestado en cualquier momento.</li>
              </ul>
              <p>
                Puedes ejercer estos derechos escribiendo a{' '}
                <a
                  href="mailto:alesx2soporte@gmail.com"
                  className="underline hover:text-ink-950"
                >
                  alesx2soporte@gmail.com
                </a>
                . También puedes presentar una reclamación ante la Agencia Española de Protección
                de Datos (AEPD) si consideras que el tratamiento no es conforme a la normativa.
              </p>
            </>
          ),
        },
        {
          heading: '7. Seguridad',
          body: (
            <p>
              Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente
              a accesos no autorizados, pérdida o destrucción accidental, incluyendo cifrado en
              tránsito (HTTPS), almacenamiento seguro de contraseñas y copias de seguridad
              regulares.
            </p>
          ),
        },
      ]}
    />
  );
}
