import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { SITE_URL, localePath, localizedAlternates, openGraphLocale } from '@/lib/seo';

type Props = { params: { locale: string } };

type Feature = { tag: string; title: string; body: string };
type Step = { n: string; title: string; body: string };
type Faq = { q: string; a: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: 'landing.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates(params.locale, '/'),
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${localePath(params.locale, '/')}`,
      title: t('title'),
      description: t('ogDescription'),
      siteName: 'Invoice Generator',
      ...openGraphLocale(params.locale),
    },
  };
}

export default function LandingPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  setRequestLocale(params.locale);
  const t = useTranslations('landing');
  const features = t.raw('features.items') as Feature[];
  const steps = t.raw('steps.items') as Step[];
  const faq = t.raw('faq.items') as Faq[];
  const em = (chunks: React.ReactNode) => <em className="italic font-normal">{chunks}</em>;

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--cream)', color: '#18181b' }}
    >
      {/* ——— NAV ——— */}
      <header
        className="relative z-20 border-b"
        style={{ borderColor: 'rgba(28,28,31,0.12)' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Invoice Generator"
              width={28}
              height={28}
              className="rounded-sm"
            />
            <span className="font-serif-display text-xl font-semibold tracking-tight">
              Invoice<span style={{ color: 'var(--stamp)' }}>.</span>
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-ink-500 ml-1 pl-2 border-l border-ink-300">
              Generator
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-700">
            <a href="#caracteristicas" className="hover:text-ink-950 transition-colors">
              {t('nav.features')}
            </a>
            <a href="#flujo" className="hover:text-ink-950 transition-colors">
              {t('nav.howItWorks')}
            </a>
            <a href="#faq" className="hover:text-ink-950 transition-colors">
              {t('nav.faq')}
            </a>
            <a
              href={`https://www.corpsc.com/${params.locale}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-ink-950 transition-colors"
              style={{ color: 'var(--stamp)' }}
            >
              CorpSC
              <span aria-hidden>↗</span>
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="mr-1 sm:mr-2" />
            <Link
              href="/login"
              className="hidden sm:inline-flex px-3.5 py-2 text-sm text-ink-900 hover:text-ink-950 transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-950 text-[#f5f1e8] text-sm font-medium rounded-full hover:bg-ink-800 transition-colors"
            >
              {t('nav.start')}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ——— HERO ——— */}
      <section className="relative overflow-hidden paper-grain">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            {/* COPY */}
            <div className="lg:col-span-7 rise">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-ink-600 mb-6">
                <span
                  className="inline-block w-6 h-px"
                  style={{ background: '#1c1c1f' }}
                />
                <span className="font-mono-tight">
                  {t('hero.eyebrow')}
                </span>
                <span
                  className="inline-block w-6 h-px"
                  style={{ background: '#1c1c1f' }}
                />
              </div>

              <h1 className="font-serif-display text-[44px] leading-[1.02] sm:text-[62px] lg:text-[78px] xl:text-[92px] font-medium tracking-[-0.02em]">
                {t('hero.titleLine1')}
                <br />
                <span className="italic" style={{ fontWeight: 400 }}>
                  {t('hero.titleItalic')}
                </span>{' '}
                <span className="underline-pencil">{t('hero.titleUnderline')}</span>.
              </h1>

              <p className="mt-7 text-lg md:text-xl text-ink-700 leading-relaxed max-w-xl">
                {t('hero.body')}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-950 text-[#f5f1e8] text-[15px] font-medium rounded-full hover:bg-ink-800 transition-all hover:gap-3"
                >
                  {t('nav.start')}
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium text-ink-900 hover:text-ink-950 transition-colors border-b border-ink-900"
                >
                  {t('hero.haveAccount')}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-600 font-mono-tight">
                <span className="flex items-center gap-1.5">
                  <Check /> {t('hero.badges.noCard')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Check /> {t('hero.badges.setup')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Check /> {t('hero.badges.multiCurrency')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Check /> {t('hero.badges.pdf')}
                </span>
              </div>
            </div>

            {/* MOCKED INVOICE */}
            <div className="lg:col-span-5 relative rise" style={{ animationDelay: '160ms' }}>
              <InvoicePreview t={t} />
            </div>
          </div>
        </div>

        {/* decorative ornament */}
        <div
          className="absolute left-0 right-0 bottom-0 h-px"
          style={{ background: 'rgba(28,28,31,0.18)' }}
        />
      </section>

      {/* ——— FEATURES ——— */}
      <section
        id="caracteristicas"
        className="relative py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14 md:mb-20">
            <div className="md:col-span-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 font-mono-tight mb-4">
                § {t('features.eyebrow')}
              </div>
              <h2 className="font-serif-display text-4xl md:text-5xl font-medium leading-[1.08] tracking-tight">
                {t.rich('features.title', { em })}
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <p className="text-lg text-ink-700 leading-relaxed">
                {t('features.body')}
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: 'rgba(28,28,31,0.15)' }}
          >
            {features.map((f) => (
              <article
                key={f.tag}
                className="p-7 md:p-8 flex flex-col gap-3 transition-colors hover:bg-[#ece6d6]"
                style={{ background: 'var(--cream)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tight text-[11px] uppercase tracking-[0.18em] text-ink-500">
                    {f.tag}
                  </span>
                  <span
                    className="font-mono-tight text-[10px] uppercase tracking-wider"
                    style={{ color: 'var(--stamp)' }}
                  >
                    {t('features.included')}
                  </span>
                </div>
                <h3 className="font-serif-display text-2xl md:text-[26px] font-medium leading-snug tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[15px] text-ink-700 leading-relaxed">
                  {f.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ——— DASHBOARD PREVIEW ——— */}
      <section
        className="relative py-20 md:py-28 border-t"
        style={{ borderColor: 'rgba(28,28,31,0.12)', background: '#faf7ee' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-10 md:mb-14">
            <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 font-mono-tight mb-4">
              § {t('reports.eyebrow')}
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl font-medium leading-[1.08] tracking-tight">
              {t.rich('reports.title', { em })}
            </h2>
            <p className="mt-5 text-lg text-ink-700 leading-relaxed">
              {t('reports.body')}
            </p>
          </div>

          <DashboardPreview t={t} />
        </div>
      </section>

      {/* ——— HOW IT WORKS ——— */}
      <section
        id="flujo"
        className="relative py-20 md:py-28"
        style={{ background: '#1c1c1f', color: '#f5f1e8' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14 md:mb-20">
            <div className="md:col-span-5">
              <div className="text-[11px] uppercase tracking-[0.22em] font-mono-tight mb-4" style={{ color: 'rgba(245,241,232,0.55)' }}>
                § {t('steps.eyebrow')}
              </div>
              <h2 className="font-serif-display text-4xl md:text-5xl font-medium leading-[1.08] tracking-tight">
                {t.rich('steps.title', { em })}
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 flex items-end">
              <p className="text-lg leading-relaxed" style={{ color: 'rgba(245,241,232,0.72)' }}>
                {t('steps.body')}
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(245,241,232,0.12)' }}>
            {steps.map((s) => (
              <li
                key={s.n}
                className="p-8 md:p-10 relative"
                style={{ background: '#1c1c1f' }}
              >
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-serif-display text-7xl md:text-8xl font-medium leading-none" style={{ color: 'var(--stamp)' }}>
                    {s.n}
                  </span>
                  <span className="font-mono-tight text-[11px] uppercase tracking-[0.22em]" style={{ color: 'rgba(245,241,232,0.5)' }}>
                    {t('steps.step')}
                  </span>
                </div>
                <h3 className="font-serif-display text-2xl md:text-[28px] font-medium leading-snug tracking-tight mb-3">
                  {s.title}
                </h3>
                <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(245,241,232,0.72)' }}>
                  {s.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-4 text-[15px] font-medium rounded-full transition-all hover:gap-3"
              style={{ background: 'var(--stamp)', color: '#fff8ee' }}
            >
              {t('steps.cta')}
              <span aria-hidden>→</span>
            </Link>
            <span className="font-mono-tight text-xs" style={{ color: 'rgba(245,241,232,0.55)' }}>
              {t('steps.fineprint')}
            </span>
          </div>
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 font-mono-tight mb-4">
                § {t('faq.eyebrow')}
              </div>
              <h2 className="font-serif-display text-4xl md:text-5xl font-medium leading-[1.08] tracking-tight">
                {t.rich('faq.title', { em })}
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <dl className="divide-y" style={{ borderColor: 'rgba(28,28,31,0.15)' }}>
                {faq.map((item, i) => (
                  <details
                    key={item.q}
                    className="group py-6 border-t"
                    style={{ borderColor: 'rgba(28,28,31,0.18)' }}
                    open={i === 0}
                  >
                    <summary className="cursor-pointer list-none flex items-start gap-4">
                      <span className="font-mono-tight text-xs text-ink-500 pt-1 shrink-0 w-8">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-serif-display text-xl md:text-[22px] font-medium leading-snug tracking-tight">
                        {item.q}
                      </span>
                      <span
                        className="shrink-0 text-xl leading-none pt-1 transition-transform group-open:rotate-45"
                        aria-hidden
                        style={{ color: 'var(--stamp)' }}
                      >
                        +
                      </span>
                    </summary>
                    <dd className="mt-3 pl-12 text-ink-700 leading-relaxed">
                      {item.a}
                    </dd>
                  </details>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ——— FINAL CTA ——— */}
      <section
        className="relative py-24 md:py-32 border-t overflow-hidden"
        style={{ borderColor: 'rgba(28,28,31,0.12)', background: 'var(--cream-dark)' }}
      >
        <div className="max-w-5xl mx-auto px-5 md:px-8 text-center relative">
          <div className="text-[11px] uppercase tracking-[0.28em] text-ink-500 font-mono-tight mb-6">
            {t('cta.eyebrow')}
          </div>
          <h2 className="font-serif-display text-5xl md:text-7xl font-medium leading-[1.02] tracking-tight">
            {t('cta.titleLine1')} <br />
            <span className="italic font-normal">{t('cta.titleItalic')}</span>
          </h2>
          <p className="mt-7 text-lg md:text-xl text-ink-700 max-w-2xl mx-auto leading-relaxed">
            {t('cta.body')}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-4 bg-ink-950 text-[#f5f1e8] text-[15px] font-medium rounded-full hover:bg-ink-800 transition-all hover:gap-3"
            >
              {t('nav.start')}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-4 text-[15px] font-medium text-ink-900 hover:text-ink-950 transition-colors border-b border-ink-900"
            >
              {t('cta.login')}
            </Link>
          </div>

          {/* stamp */}
          <div
            className="hidden md:block absolute top-8 right-8 stamp-rotate px-3 py-1.5 border-2 rounded-sm font-mono-tight text-[10px] uppercase tracking-[0.22em]"
            style={{ borderColor: 'var(--stamp)', color: 'var(--stamp)' }}
          >
            {t('cta.stamp')}
          </div>
        </div>
      </section>

    </main>
  );
}

/* ——— PARTS ——— */

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 6.3 L4.8 9 L10 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LandingT = ReturnType<typeof useTranslations<'landing'>>;

function InvoicePreview({ t }: { t: LandingT }) {
  const rows = t.raw('invoicePreview.rows') as [string, string, string][];
  return (
    <div className="relative">
      {/* decorative back-card */}
      <div
        className="absolute inset-0 tilt-left rounded-sm border shadow-[0_1px_0_0_rgba(28,28,31,0.1)]"
        style={{ background: '#ece6d6', borderColor: 'rgba(28,28,31,0.15)', transform: 'rotate(-3deg) translate(-16px, 14px)' }}
        aria-hidden
      />
      {/* front invoice */}
      <div
        className="relative tilt-right rounded-sm border bg-white overflow-hidden"
        style={{
          borderColor: 'rgba(28,28,31,0.2)',
          boxShadow:
            '0 1px 0 rgba(28,28,31,0.06), 0 24px 40px -16px rgba(28,28,31,0.22), 0 8px 16px -8px rgba(28,28,31,0.14)',
        }}
      >
        {/* paid stamp */}
        <div
          className="absolute top-5 right-5 stamp-rotate px-2.5 py-1 border-2 rounded-sm font-mono-tight text-[9px] uppercase tracking-[0.22em] z-10"
          style={{ borderColor: 'var(--stamp)', color: 'var(--stamp)' }}
        >
          {t('invoicePreview.stamp')}
        </div>

        <div className="p-7">
          {/* header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="font-mono-tight text-[10px] uppercase tracking-[0.2em] text-ink-500">
                {t('invoicePreview.invoice')}
              </div>
              <div className="font-serif-display text-3xl font-medium mt-0.5 leading-none">
                {t('invoicePreview.number')}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono-tight text-[10px] uppercase tracking-[0.2em] text-ink-500">
                {t('invoicePreview.issuer')}
              </div>
              <div className="text-sm font-semibold mt-0.5">Estudio Orbita</div>
              <div className="text-xs text-ink-500">B-12345678</div>
            </div>
          </div>

          <div className="h-px hairline mb-5" />

          {/* meta grid */}
          <div className="grid grid-cols-3 gap-4 text-xs mb-6">
            <div>
              <div className="text-ink-500 uppercase tracking-wide font-mono-tight text-[10px] mb-1">
                {t('invoicePreview.client')}
              </div>
              <div className="font-medium text-ink-900">Casa Lumina, S.L.</div>
              <div className="text-ink-600">Madrid · ES</div>
            </div>
            <div>
              <div className="text-ink-500 uppercase tracking-wide font-mono-tight text-[10px] mb-1">
                {t('invoicePreview.date')}
              </div>
              <div className="font-mono-tight num-dot text-ink-900">02 · 04 · 2026</div>
              <div className="text-ink-600">{t('invoicePreview.due')}</div>
            </div>
            <div>
              <div className="text-ink-500 uppercase tracking-wide font-mono-tight text-[10px] mb-1">
                {t('invoicePreview.currency')}
              </div>
              <div className="font-mono-tight text-ink-900">EUR €</div>
              <div className="text-ink-600">{t('invoicePreview.transfer')}</div>
            </div>
          </div>

          {/* line items */}
          <div className="text-xs mb-5">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 font-mono-tight uppercase tracking-[0.15em] text-[9px] text-ink-500 pb-2 border-b border-ink-200">
              <span>{t('invoicePreview.concept')}</span>
              <span>{t('invoicePreview.qty')}</span>
              <span className="text-right">{t('invoicePreview.amount')}</span>
            </div>
            {rows.map(([c, q, i]) => (
              <div
                key={c}
                className="grid grid-cols-[1fr_auto_auto] gap-4 py-2 border-b border-dashed border-ink-200 text-ink-900"
              >
                <span>{c}</span>
                <span className="font-mono-tight text-ink-600">{q}</span>
                <span className="font-mono-tight text-right num-dot">{i}</span>
              </div>
            ))}
          </div>

          {/* totals */}
          <div className="flex justify-end">
            <div className="w-56 space-y-1.5 text-xs">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal</span>
                <span className="font-mono-tight num-dot">{t('invoicePreview.subtotal')}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>{t('invoicePreview.vatLabel')}</span>
                <span className="font-mono-tight num-dot">{t('invoicePreview.vat')}</span>
              </div>
              <div className="h-px hairline my-2" />
              <div className="flex justify-between items-baseline">
                <span className="font-mono-tight uppercase text-[10px] tracking-[0.18em] text-ink-500">
                  Total
                </span>
                <span className="font-serif-display text-2xl font-medium num-dot">
                  {t('invoicePreview.total')}
                </span>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="mt-6 pt-4 border-t border-ink-200 flex items-center justify-between text-[10px] font-mono-tight text-ink-500 uppercase tracking-[0.16em]">
            <span>{t('invoicePreview.generated')}</span>
            <span>{t('invoicePreview.page')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview({ t }: { t: LandingT }) {
  const kpis = t.raw('dashboardPreview.kpis') as [string, string, string][];
  return (
    <div
      className="relative rounded-2xl border overflow-hidden"
      style={{
        borderColor: 'rgba(28,28,31,0.18)',
        background: '#ffffff',
        boxShadow:
          '0 1px 0 rgba(28,28,31,0.04), 0 24px 50px -20px rgba(28,28,31,0.18)',
      }}
    >
      {/* browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'rgba(28,28,31,0.12)', background: '#faf7ee' }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        <div className="ml-3 text-[11px] font-mono-tight text-ink-500">
          invoicegen.app/app
        </div>
      </div>

      {/* content */}
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="font-serif-display text-2xl font-medium">Dashboard</div>
            <div className="text-xs text-ink-500 mt-0.5">
              <span className="text-ink-800 font-medium">Estudio Orbita</span>
              {t('dashboardPreview.owner')}
            </div>
          </div>
          <span
            className="px-3.5 py-2 text-xs font-medium rounded-full"
            style={{ background: '#18181b', color: '#f5f1e8' }}
          >
            {t('dashboardPreview.newInvoice')}
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {kpis.map(([l, v, h]) => (
            <div
              key={l}
              className="rounded-xl border p-4"
              style={{ borderColor: 'rgba(28,28,31,0.12)' }}
            >
              <div className="text-[10px] uppercase tracking-wide text-ink-500 font-mono-tight">
                {l}
              </div>
              <div className="font-mono-tight text-xl font-semibold mt-1 num-dot">{v}</div>
              <div className="text-[11px] text-ink-500 mt-0.5">{h}</div>
            </div>
          ))}
        </div>

        {/* chart + donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div
            className="lg:col-span-2 rounded-xl border p-5"
            style={{ borderColor: 'rgba(28,28,31,0.12)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold">{t('dashboardPreview.last6')}</div>
              <div className="text-[10px] font-mono-tight text-ink-500">EUR</div>
            </div>
            <MiniChart months={t.raw('dashboardPreview.months') as string[]} />
          </div>
          <div
            className="rounded-xl border p-5 flex items-center gap-5"
            style={{ borderColor: 'rgba(28,28,31,0.12)' }}
          >
            <MiniDonut label={t('dashboardPreview.invoices')} />
            <ul className="text-xs space-y-2.5 flex-1">
              <li className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: '#10b981' }} /><span className="flex-1 text-ink-700">{t('dashboardPreview.paid')}</span><span className="font-semibold">12</span></li>
              <li className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: '#3b82f6' }} /><span className="flex-1 text-ink-700">{t('dashboardPreview.sent')}</span><span className="font-semibold">4</span></li>
              <li className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: '#a1a1aa' }} /><span className="flex-1 text-ink-700">{t('dashboardPreview.drafts')}</span><span className="font-semibold">2</span></li>
              <li className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: '#ef4444' }} /><span className="flex-1 text-ink-700">{t('dashboardPreview.cancelled')}</span><span className="font-semibold">0</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ months }: { months: string[] }) {
  const points = [3200, 5800, 4100, 6900, 7400, 8420].map((value, i) => ({
    label: months[i],
    value,
  }));
  const w = 520;
  const h = 150;
  const pad = { t: 10, r: 10, b: 22, l: 36 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(...points.map((p) => p.value));
  const step = iw / (points.length - 1);
  const coords = points.map((p, i) => ({
    x: pad.l + step * i,
    y: pad.t + ih - (p.value / max) * ih,
    ...p,
  }));
  const path = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const area =
    path +
    ` L ${coords[coords.length - 1].x} ${pad.t + ih} L ${coords[0].x} ${pad.t + ih} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {[0, 0.5, 1].map((t, i) => (
        <line
          key={i}
          x1={pad.l}
          x2={w - pad.r}
          y1={pad.t + ih - t * ih}
          y2={pad.t + ih - t * ih}
          stroke="#e5e5e7"
          strokeDasharray="3 3"
        />
      ))}
      <path d={area} fill="#18181b" fillOpacity="0.06" />
      <path d={path} fill="none" stroke="#18181b" strokeWidth="1.8" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="2.8" fill="#18181b" />
          <text x={c.x} y={h - 6} textAnchor="middle" fontSize="9" fill="#71717a">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MiniDonut({ label }: { label: string }) {
  const segs = [
    { v: 12, c: '#10b981' },
    { v: 4, c: '#3b82f6' },
    { v: 2, c: '#a1a1aa' },
  ];
  const total = segs.reduce((a, s) => a + s.v, 0);
  const size = 124;
  const r = 50;
  const stroke = 16;
  const C = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
      {segs.map((s, i) => {
        const len = (s.v / total) * C;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.c}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-off}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        off += len;
        return el;
      })}
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize="20" fontWeight="700">
        {total}
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="9" fill="#71717a">
        {label}
      </text>
    </svg>
  );
}
