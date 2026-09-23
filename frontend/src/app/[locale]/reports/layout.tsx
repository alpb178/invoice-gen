import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: 'reports' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
