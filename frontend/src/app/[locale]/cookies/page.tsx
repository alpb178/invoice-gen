import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LegalPage from '@/components/LegalPage';
import { cookies } from '@/content/legal/cookies';
import { isLocale } from '@/i18n/config';
import { localizedAlternates } from '@/lib/seo';

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  if (!isLocale(params.locale)) return {};
  const doc = cookies[params.locale];
  return {
    title: doc.title,
    description: doc.description,
    alternates: localizedAlternates(params.locale, '/cookies'),
  };
}

export default function CookiesPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  setRequestLocale(params.locale);
  const doc = cookies[params.locale];
  return (
    <LegalPage
      eyebrow="§ Legal"
      title={doc.title}
      updatedAt={doc.updatedAt}
      summary={doc.summary}
      sections={doc.sections}
    />
  );
}
