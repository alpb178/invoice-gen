import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { isLocale } from '@/i18n/config';
import { localePath } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: 'login' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
    alternates: { canonical: localePath(params.locale, '/login') },
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
