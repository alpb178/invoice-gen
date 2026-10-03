// src/app/not-found.tsx
//
// The 404 page for every locale. Unknown paths match no route, so Next renders
// this file with a real 404 status. It sits outside app/[locale] (and therefore
// outside the auth guard, which would otherwise swap it for a redirect to
// login), so it renders its own <html>. The locale comes from the middleware,
// which prefixed the path and passed the locale on to the request.
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import GroupTicker from '@/components/GroupTicker';
import SiteFooter from '@/components/SiteFooter';
import { Link } from '@/i18n/navigation';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'notFound' });

  return (
    <html lang={locale} className={fontVariables}>
      <head>
        <title>{`${t('metaTitle')} | Invoice Generator`}</title>
        <meta name="description" content={t('metaDescription')} />
      </head>
      <body className="min-h-screen bg-cream text-ink-900 antialiased flex flex-col">
        <NextIntlClientProvider>
          <GroupTicker />
          <main
            className="flex-1 flex items-center justify-center px-5 py-20"
            style={{ background: 'var(--cream)', color: '#18181b' }}
          >
            <div className="max-w-xl text-center">
              <div className="font-mono-tight text-[11px] uppercase tracking-[0.28em] text-ink-500 mb-6">
                Error · 404
              </div>
              <h1 className="font-serif-display text-6xl md:text-8xl font-medium leading-[1.02] tracking-tight">
                {t.rich('title', { em: (chunks) => <em className="italic font-normal">{chunks}</em> })}
              </h1>
              <p className="mt-6 text-lg text-ink-700 leading-relaxed">{t('body')}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/"
                  locale={locale}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-950 text-[#f5f1e8] text-[15px] font-medium rounded-full hover:bg-ink-800 transition-all hover:gap-3"
                >
                  {t('home')}
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/login"
                  locale={locale}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium text-ink-900 hover:text-ink-950 transition-colors border-b border-ink-900"
                >
                  {t('login')}
                </Link>
              </div>
            </div>
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
