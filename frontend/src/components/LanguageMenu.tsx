'use client';

import { forwardRef, useEffect, useState, type ComponentProps, type ComponentPropsWithoutRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { isLocale } from '@/i18n/config';
import { Link, usePathname } from '@/i18n/navigation';
import { GROUP_LANGUAGES, LanguageSwitcher } from './LanguageSwitcher';

/**
 * next-intl's Link fed with the menu's plain hrefs (`/pt/privacy?next=…`): the
 * first segment becomes the `locale` prop and the rest the href. Going through
 * next-intl (rather than next/link) is what stores the choice in the
 * NEXT_LOCALE cookie, so a later visit to `/` lands on the same language.
 */
const LocaleLink = forwardRef<HTMLAnchorElement, Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: string }>(
  function LocaleLink({ href, ...rest }, ref) {
    const match = href.match(/^\/([^/?#]+)([^?#]*)(.*)$/);
    const locale = match && isLocale(match[1]) ? match[1] : undefined;
    const path = match && locale ? `${match[2] || '/'}${match[3]}` : href;
    return <Link ref={ref} href={path} locale={locale} {...rest} />;
  },
  // With @types/react 18, a forwardRef component's ref is `LegacyRef` (string
  // refs included), which the shared `LinkLike` type (`Ref`) does not accept.
) as unknown as LinkAs;

type LinkAs = NonNullable<ComponentProps<typeof LanguageSwitcher>['linkAs']>;

interface Props {
  /** `dark` on the black footer; `light` (default) on paper. */
  tone?: 'light' | 'dark';
  placement?: 'bottom' | 'top';
  align?: 'start' | 'end';
  className?: string;
  onSelect?: (code: string) => void;
}

/**
 * This site's wiring of the group language menu (LanguageSwitcher.tsx, shared
 * verbatim with the other CORPSC sites). Each option points at the current
 * page in that language, query string included, so /login?next=… survives the
 * switch. The query is read after mount: reading it during render would opt
 * every static page out of static rendering.
 */
export default function LanguageMenu({ tone = 'light', className = '', ...rest }: Props) {
  const current = useLocale();
  const pathname = usePathname();
  const t = useTranslations('languageSwitcher');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  const suffix = `${pathname === '/' ? '' : pathname}${search}`;
  // Only the group languages this site is translated into.
  const options = GROUP_LANGUAGES.filter((lang) => isLocale(lang.code)).map((lang) => ({
    ...lang,
    href: `/${lang.code}${suffix}`,
  }));

  return (
    <LanguageSwitcher
      current={current}
      options={options}
      linkAs={LocaleLink}
      label={t('label')}
      className={`lang-menu ${tone === 'dark' ? 'lang-menu--dark' : ''} ${className}`}
      {...rest}
    />
  );
}
