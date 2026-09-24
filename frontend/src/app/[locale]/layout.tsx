// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { ToastProvider } from '@/components/Toast';
import { isLocale, langTag, locales, type Locale } from '@/i18n/config';
import { SITE_URL, localePath, openGraphLocale } from '@/lib/seo';
import { fontVariables } from '../fonts';
import '../globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-VE1TD804SQ';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-N77TTLKW';

type Props = { children: React.ReactNode; params: { locale: string } };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('title');
  const description = t('description');
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | Invoice Generator',
    },
    description,
    applicationName: 'Invoice Generator',
    keywords: t('keywords').split(', '),
    authors: [{ name: 'Invoice Generator' }],
    creator: 'Invoice Generator',
    publisher: 'Invoice Generator',
    alternates: {
      canonical: localePath(locale, '/'),
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
      ...openGraphLocale(locale),
      url: `${SITE_URL}${localePath(locale, '/')}`,
      title,
      description,
      siteName: 'Invoice Generator',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t('twitterDescription'),
    },
    verification: {
      google:
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        'wfMJ5S-UA-3pSEJwjIBKbCxs_2xkysNHmfNtR-84RU4',
    },
    category: 'business',
  };
}

function jsonLd(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Invoice Generator',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Invoice Generator',
        url: SITE_URL,
        inLanguage: langTag[locale],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Invoice Generator',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        description,
        inLanguage: langTag[locale],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  };
}

export default function LocaleLayout({ children, params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  // Lets the server components below render statically for this locale.
  setRequestLocale(locale);
  const t = useTranslations('meta');

  return (
    <html lang={langTag[locale]} className={fontVariables}>
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(locale, t('description'))) }}
        />
      </head>
      <body className="min-h-screen bg-cream text-ink-900 antialiased flex flex-col">
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

        {/* The intl provider hands messages to the client components. The
            toast provider wraps the whole app: toasts must be able to fire
            from any screen, including login and sign-up (which sit outside
            the app shell). */}
        <NextIntlClientProvider>
          <ToastProvider>
            <AuthGuard>
              <AppShell>{children}</AppShell>
            </AuthGuard>
          </ToastProvider>
        </NextIntlClientProvider>
        {/* Renders nothing: sends the visit and the clicks to the group hub. */}
        <SiteAnalytics />
      </body>
    </html>
  );
}
