'use client';

import { useLocale, useTranslations } from 'next-intl';
import { locales } from '@/i18n/config';
import { Link, usePathname, useRouter } from '@/i18n/navigation';

interface Props {
  /** `dark` for the black footer; `light` (default) on paper. */
  tone?: 'light' | 'dark';
  className?: string;
}

// ES · EN toggle. Each option is a real link to the same page in the other
// locale (crawlable, works without JS). On click it keeps the query string too,
// so /login?next=… survives the switch; next-intl stores the choice in the
// NEXT_LOCALE cookie.
export default function LanguageSwitcher({ tone = 'light', className = '' }: Props) {
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('languageSwitcher');

  const idle = tone === 'dark' ? 'text-[#a1a1aa] hover:text-white' : 'text-ink-500 hover:text-ink-900';
  const active = tone === 'dark' ? 'text-white' : 'text-ink-900';

  return (
    <nav aria-label={t('label')} className={`flex items-center gap-1.5 text-xs font-mono-tight uppercase tracking-[0.14em] ${className}`}>
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className={tone === 'dark' ? 'text-[#52525b]' : 'text-ink-300'}>·</span>}
          {locale === current ? (
            <span aria-current="true" className={`font-semibold ${active}`}>
              {locale}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              title={t(locale)}
              aria-label={t(locale)}
              data-track-label={`language-${locale}`}
              onClick={(e) => {
                const search = window.location.search;
                if (!search) return;
                e.preventDefault();
                router.replace(`${pathname}${search}`, { locale });
              }}
              className={`transition-colors ${idle}`}
            >
              {locale}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
