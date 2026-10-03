import type { LegalDoc } from '@/components/LegalPage';
import type { Locale } from '@/i18n/config';

const es: LegalDoc = {
  title: 'Política de privacidad',
  description:
    'Política de privacidad de Invoice Generator: qué datos recopilamos, con qué finalidad, durante cuánto tiempo y cuáles son tus derechos.',
  updatedAt: '27 de mayo de 2026',
  summary:
    'Respetamos tu privacidad. Aquí explicamos qué datos tratamos, por qué y cómo puedes ejercer tus derechos.',
  sections: [
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
  ],
};

const en: LegalDoc = {
  title: 'Privacy policy',
  description:
    'Invoice Generator privacy policy: what data we collect, why, for how long, and what your rights are.',
  updatedAt: 'May 27, 2026',
  summary:
    'We respect your privacy. Here we explain what data we process, why, and how you can exercise your rights.',
  sections: [
    {
      heading: '1. Data controller',
      body: (
        <p>
          The controller of your personal data is <strong>Invoice Generator</strong>, reachable
          at{' '}
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
      heading: '2. Data we process',
      body: (
        <>
          <p>We process the following categories of data:</p>
          <ul>
            <li>
              <strong>Account data</strong>: email address and encrypted password.
            </li>
            <li>
              <strong>Billing data</strong>: company name, tax ID (CIF/NIF), registered address,
              clients and invoice line items.
            </li>
            <li>
              <strong>Technical data</strong>: IP address, browser, operating system and pages
              visited, collected for analytics and security purposes.
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: '3. Purpose and legal basis',
      body: (
        <>
          <p>We process your data to:</p>
          <ul>
            <li>Provide the Service and keep your account running (performance of a contract).</li>
            <li>Meet tax and accounting obligations (legal obligation).</li>
            <li>
              Improve the product through anonymized analytics and service communications
              (legitimate interest).
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: '4. Retention',
      body: (
        <p>
          We keep your data while your account is active. After it is closed, billing data is
          kept for the mandatory legal periods (typically 6 years in Spain) and account data is
          deleted or anonymized within 30 days at most.
        </p>
      ),
    },
    {
      heading: '5. Recipients',
      body: (
        <>
          <p>
            We do not sell or hand over your data to third parties. We only share information
            with providers of essential technical services:
          </p>
          <ul>
            <li>Hosting and database providers.</li>
            <li>Web analytics and product metrics services.</li>
            <li>Payment gateways, where applicable.</li>
          </ul>
          <p>
            All providers meet the safeguards required by the GDPR and have signed data
            processing agreements.
          </p>
        </>
      ),
    },
    {
      heading: '6. Your rights',
      body: (
        <>
          <p>As the data subject, you have the right to:</p>
          <ul>
            <li>Access, rectify and erase your data.</li>
            <li>Object to processing and request its restriction.</li>
            <li>Request data portability.</li>
            <li>Withdraw your consent at any time.</li>
          </ul>
          <p>
            You can exercise these rights by writing to{' '}
            <a
              href="mailto:alesx2soporte@gmail.com"
              className="underline hover:text-ink-950"
            >
              alesx2soporte@gmail.com
            </a>
            . You can also lodge a complaint with the Spanish Data Protection Agency (AEPD) if you
            believe the processing does not comply with the regulations.
          </p>
        </>
      ),
    },
    {
      heading: '7. Security',
      body: (
        <p>
          We apply appropriate technical and organizational measures to protect your data against
          unauthorized access, accidental loss or destruction, including encryption in transit
          (HTTPS), secure password storage and regular backups.
        </p>
      ),
    },
  ],
};

const pt: LegalDoc = {
  title: 'Política de privacidade',
  description:
    'Política de privacidade do Invoice Generator: quais dados coletamos, para qual finalidade, por quanto tempo e quais são os seus direitos.',
  updatedAt: '27 de maio de 2026',
  summary:
    'Respeitamos a sua privacidade. Aqui explicamos quais dados tratamos, por que e como você pode exercer os seus direitos.',
  sections: [
    {
      heading: '1. Controlador dos dados',
      body: (
        <p>
          O controlador dos seus dados pessoais é o{' '}
          <strong>Invoice Generator</strong>, com endereço de contato{' '}
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
      heading: '2. Dados que tratamos',
      body: (
        <>
          <p>Tratamos as seguintes categorias de dados:</p>
          <ul>
            <li>
              <strong>Dados da conta</strong>: e-mail e senha criptografada.
            </li>
            <li>
              <strong>Dados de faturamento</strong>: nome da empresa, CIF/NIF, endereço
              fiscal, clientes e itens da fatura.
            </li>
            <li>
              <strong>Dados técnicos</strong>: endereço IP, navegador, sistema operacional e
              páginas visitadas, coletados para fins analíticos e de segurança.
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: '3. Finalidade e base legal',
      body: (
        <>
          <p>Tratamos os seus dados para:</p>
          <ul>
            <li>Prestar o Serviço e manter a sua conta operacional (execução de contrato).</li>
            <li>Cumprir obrigações fiscais e contábeis (obrigação legal).</li>
            <li>
              Melhorar o produto por meio de análises anonimizadas e comunicações sobre o
              serviço (interesse legítimo).
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: '4. Retenção',
      body: (
        <p>
          Mantemos os seus dados enquanto a sua conta estiver ativa. Após o cancelamento, os
          dados de faturamento serão mantidos pelos prazos legais obrigatórios (normalmente 6
          anos na Espanha) e os dados da conta serão excluídos ou anonimizados em um prazo
          máximo de 30 dias.
        </p>
      ),
    },
    {
      heading: '5. Destinatários',
      body: (
        <>
          <p>
            Não vendemos nem cedemos os seus dados a terceiros. Compartilhamos informações
            apenas com fornecedores que prestam serviços técnicos essenciais:
          </p>
          <ul>
            <li>Fornecedores de hospedagem e bancos de dados.</li>
            <li>Serviços de análise web e métricas de produto.</li>
            <li>Gateways de pagamento, quando aplicável.</li>
          </ul>
          <p>
            Todos os fornecedores cumprem as garantias exigidas pelo RGPD e assinaram
            contratos de tratamento de dados.
          </p>
        </>
      ),
    },
    {
      heading: '6. Os seus direitos',
      body: (
        <>
          <p>Como titular dos dados, você tem direito a:</p>
          <ul>
            <li>Acessar, corrigir e excluir os seus dados.</li>
            <li>Opor-se ao tratamento e solicitar a sua limitação.</li>
            <li>Solicitar a portabilidade dos dados.</li>
            <li>Revogar o consentimento dado a qualquer momento.</li>
          </ul>
          <p>
            Você pode exercer esses direitos escrevendo para{' '}
            <a
              href="mailto:alesx2soporte@gmail.com"
              className="underline hover:text-ink-950"
            >
              alesx2soporte@gmail.com
            </a>
            . Você também pode apresentar uma reclamação à Agência Espanhola de Proteção de
            Dados (AEPD) se considerar que o tratamento não está em conformidade com a
            legislação.
          </p>
        </>
      ),
    },
    {
      heading: '7. Segurança',
      body: (
        <p>
          Aplicamos medidas técnicas e organizacionais adequadas para proteger os seus dados
          contra acessos não autorizados, perda ou destruição acidental, incluindo
          criptografia em trânsito (HTTPS), armazenamento seguro de senhas e backups
          regulares.
        </p>
      ),
    },
  ],
};

export const privacy: Record<Locale, LegalDoc> = { es, en, pt };
