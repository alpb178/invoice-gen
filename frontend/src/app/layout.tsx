// src/app/layout.tsx
import type { Metadata } from 'next';
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import AuthGuard from '@/components/AuthGuard';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

const TITLE = 'Invoice Generator - Crea y gestiona facturas profesionales online';
const DESCRIPTION =
  'Crea, personaliza y descarga facturas profesionales en PDF de forma rápida y sencilla. Gestiona clientes, equipos y facturación multi-sección en un solo lugar.';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-VE1TD804SQ';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-N77TTLKW';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | Invoice Generator',
  },
  description: DESCRIPTION,
  applicationName: 'Invoice Generator',
  keywords: [
    'generador de facturas',
    'crear facturas online',
    'facturación',
    'facturas PDF',
    'invoice generator',
    'facturas profesionales',
    'software de facturación',
    'gestión de facturas',
  ],
  authors: [{ name: 'Invoice Generator' }],
  creator: 'Invoice Generator',
  publisher: 'Invoice Generator',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Invoice Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description:
      'Crea, personaliza y descarga facturas profesionales en PDF de forma rápida y sencilla.',
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      'wfMJ5S-UA-3pSEJwjIBKbCxs_2xkysNHmfNtR-84RU4',
  },
  category: 'business',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Invoice Generator',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Invoice Generator',
      url: SITE_URL,
      inLanguage: 'es',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Invoice Generator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: 'es',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${dmSans.variable} ${fraunces.variable} ${mono.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-paper text-ink-900 antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
