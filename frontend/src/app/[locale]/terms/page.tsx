import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LegalPage from '@/components/LegalPage';
import { terms } from '@/content/legal/terms';
import { isLocale } from '@/i18n/config';
import { localizedAlternates } from '@/lib/seo';

type Props = { params: { locale: string } };

export function generateMetadata({ params }: Props): Metadata {
  if (!isLocale(params.locale)) return {};
  const doc = terms[params.locale];
  return {
    title: doc.title,
    description: doc.description,
    alternates: localizedAlternates(params.locale, '/terms'),
  };
}

export default function TermsPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  setRequestLocale(params.locale);
  const doc = terms[params.locale];
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
