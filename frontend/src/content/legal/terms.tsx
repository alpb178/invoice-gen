import type { LegalDoc } from '@/components/LegalPage';
import type { Locale } from '@/i18n/config';

const es: LegalDoc = {
  title: 'Términos y condiciones',
  description:
    'Términos y condiciones de uso del servicio Invoice Generator. Lee los derechos y obligaciones aplicables al uso de la plataforma.',
  updatedAt: '27 de mayo de 2026',
  summary:
    'Estos términos rigen el uso de Invoice Generator. Al crear una cuenta o usar el servicio, aceptas estas condiciones.',
  sections: [
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
  ],
};

const en: LegalDoc = {
  title: 'Terms and conditions',
  description:
    'Terms and conditions of use of the Invoice Generator service. Read the rights and obligations that apply to using the platform.',
  updatedAt: 'May 27, 2026',
  summary:
    'These terms govern the use of Invoice Generator. By creating an account or using the service, you accept these conditions.',
  sections: [
    {
      heading: '1. Purpose and acceptance',
      body: (
        <>
          <p>
            These terms and conditions (the <strong>“Terms”</strong>) govern access to and use of
            the <strong>Invoice Generator</strong> platform (the <strong>“Service”</strong>),
            available at <em>invoices.corpsc.com</em> and its subdomains.
          </p>
          <p>
            Using the Service means you fully and unreservedly accept these Terms. If you do not
            agree with any of them, please do not use the Service.
          </p>
        </>
      ),
    },
    {
      heading: '2. Sign-up and user account',
      body: (
        <>
          <p>
            To use the features of the Service you need to create an account with a valid email
            address and a password. The user is responsible for:
          </p>
          <ul>
            <li>Keeping their credentials confidential.</li>
            <li>Reporting any unauthorized use of their account.</li>
            <li>The accuracy and currency of the data provided.</li>
          </ul>
        </>
      ),
    },
    {
      heading: '3. Permitted use',
      body: (
        <>
          <p>
            The Service is offered solely for creating, managing and issuing commercial invoices.
            It must not be used for:
          </p>
          <ul>
            <li>Fraudulent or unlawful purposes, or purposes contrary to good faith.</li>
            <li>Identity theft or issuing false documents.</li>
            <li>Activities that could harm the Service’s infrastructure.</li>
          </ul>
        </>
      ),
    },
    {
      heading: '4. Intellectual property',
      body: (
        <p>
          All intellectual and industrial property rights over the Service, its code, designs,
          logos and content belong to Invoice Generator or to third parties who have authorized
          their use. The user keeps ownership of the data and content they enter into the
          platform.
        </p>
      ),
    },
    {
      heading: '5. Limitation of liability',
      body: (
        <p>
          The Service is provided “as is”, with no guarantee of continuous availability. Invoice
          Generator will not be liable for direct or indirect damages arising from the use of, or
          inability to use, the Service, except where provided by applicable law.
        </p>
      ),
    },
    {
      heading: '6. Changes and termination',
      body: (
        <p>
          We reserve the right to change these Terms at any time. Changes will be published on
          this page together with the update date. The user can close their account at any time
          from the settings panel.
        </p>
      ),
    },
    {
      heading: '7. Governing law',
      body: (
        <p>
          These Terms are governed by Spanish law. Any dispute about their interpretation or
          performance will be submitted to the courts of the user’s place of residence, unless
          mandatory law provides otherwise.
        </p>
      ),
    },
    {
      heading: '8. Contact',
      body: (
        <p>
          For any question about these Terms you can write to us at{' '}
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
  ],
};

export const terms: Record<Locale, LegalDoc> = { es, en };
