import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description:
    'Términos y condiciones de uso del servicio Invoice Generator. Lee los derechos y obligaciones aplicables al uso de la plataforma.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="§ Legal"
      title="Términos y condiciones"
      updatedAt="27 de mayo de 2026"
      summary="Estos términos rigen el uso de Invoice Generator. Al crear una cuenta o usar el servicio, aceptas estas condiciones."
      sections={[
        {
          heading: '1. Objeto y aceptación',
          body: (
            <>
              <p>
                Estos términos y condiciones (en adelante, los <strong>«Términos»</strong>) regulan
                el acceso y uso de la plataforma <strong>Invoice Generator</strong> (en adelante,
                el <strong>«Servicio»</strong>), accesible desde <em>invoices.corpsc.com</em> y sus
                subdominios.
              </p>
              <p>
                El uso del Servicio implica la aceptación plena y sin reservas de los presentes
                Términos. Si no estás de acuerdo con alguno de los puntos, te rogamos no utilizar
                el Servicio.
              </p>
            </>
          ),
        },
        {
          heading: '2. Registro y cuenta de usuario',
          body: (
            <>
              <p>
                Para utilizar las funcionalidades del Servicio es necesario crear una cuenta
                proporcionando una dirección de correo electrónico válida y una contraseña. El
                usuario es responsable de:
              </p>
              <ul>
                <li>Mantener la confidencialidad de sus credenciales.</li>
                <li>Notificar cualquier uso no autorizado de su cuenta.</li>
                <li>La veracidad y actualización de los datos facilitados.</li>
              </ul>
            </>
          ),
        },
        {
          heading: '3. Uso permitido',
          body: (
            <>
              <p>
                El Servicio se ofrece exclusivamente para la creación, gestión y emisión de
                facturas comerciales. Queda prohibido utilizarlo para:
              </p>
              <ul>
                <li>Fines fraudulentos, ilícitos o contrarios a la buena fe.</li>
                <li>Suplantación de identidad o emisión de documentos falsos.</li>
                <li>Realización de actividades que puedan dañar la infraestructura del Servicio.</li>
              </ul>
            </>
          ),
        },
        {
          heading: '4. Propiedad intelectual',
          body: (
            <p>
              Todos los derechos de propiedad intelectual e industrial sobre el Servicio, su
              código, diseños, logotipos y contenidos pertenecen a Invoice Generator o a terceros
              que han autorizado su uso. El usuario conserva la titularidad de los datos y
              contenidos que introduce en la plataforma.
            </p>
          ),
        },
        {
          heading: '5. Limitación de responsabilidad',
          body: (
            <p>
              El Servicio se presta «tal cual» sin garantías de disponibilidad continua. Invoice
              Generator no será responsable de daños directos o indirectos derivados del uso o
              imposibilidad de uso del Servicio, salvo en los casos previstos por la legislación
              aplicable.
            </p>
          ),
        },
        {
          heading: '6. Modificaciones y terminación',
          body: (
            <p>
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los
              cambios se publicarán en esta misma página con la fecha de actualización. El usuario
              puede cancelar su cuenta en cualquier momento desde el panel de ajustes.
            </p>
          ),
        },
        {
          heading: '7. Legislación aplicable',
          body: (
            <p>
              Estos Términos se rigen por la legislación española. Cualquier controversia
              relacionada con su interpretación o cumplimiento se someterá a los Juzgados y
              Tribunales del domicilio del usuario, salvo disposición legal imperativa en
              contrario.
            </p>
          ),
        },
        {
          heading: '8. Contacto',
          body: (
            <p>
              Para cualquier consulta sobre estos Términos puedes escribirnos a{' '}
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
      ]}
    />
  );
}
