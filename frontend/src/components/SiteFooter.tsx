'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { intlTag } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

const CONTACT_EMAIL = 'alesx2soporte@gmail.com';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const locale = useLocale();
  const t = useTranslations('footer');
  return (
    <footer
      className="mt-auto border-t"
      style={{
        background: '#0a0a0c',
        color: '#f4f4f5',
        borderColor: 'rgba(255,255,255,0.10)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Image src="/logo.png" alt="" width={40} height={40} className="rounded-md" />
              <div>
                <div className="font-serif-display text-lg font-semibold leading-tight text-white">
                  Invoice<span style={{ color: 'var(--stamp)' }}>.</span>Generator
                </div>
                <div className="text-[11px] uppercase tracking-[0.22em] font-mono-tight mt-0.5" style={{ color: '#a1a1aa' }}>
                  {t('tagline')}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#e4e4e7' }}>
              {t('blurb')}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-mono-tight" style={{ color: '#d4d4d8' }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }}
                aria-hidden
              />
              {t('status')}
            </div>
          </div>

          <div>
            <div className="font-mono-tight text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: '#a1a1aa' }}>
              § {t('product')}
            </div>
            <ul className="space-y-2.5 text-sm" style={{ color: '#f4f4f5' }}>
              <li><Link href="/#caracteristicas" className="hover:text-white transition-colors">{t('features')}</Link></li>
              <li><Link href="/#flujo" className="hover:text-white transition-colors">{t('howItWorks')}</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">{t('faq')}</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">{t('createAccount')}</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono-tight text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: '#a1a1aa' }}>
              § {t('account')}
            </div>
            <ul className="space-y-2.5 text-sm" style={{ color: '#f4f4f5' }}>
              <li><Link href="/login" className="hover:text-white transition-colors">{t('login')}</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">{t('register')}</Link></li>
              <li><Link href="/app" className="hover:text-white transition-colors">{t('goToPanel')}</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono-tight text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: '#a1a1aa' }}>
              § Legal
            </div>
            <ul className="space-y-2.5 text-sm" style={{ color: '#f4f4f5' }}>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t('terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">{t('cookies')}</Link></li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="hover:text-white transition-colors"
                >
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs font-mono-tight"
          style={{ borderColor: 'rgba(255,255,255,0.10)', color: '#a1a1aa' }}
        >
          <div>
            © {year} Invoice Generator · {t('rights')}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>v.2026.04</span>
            <span aria-hidden>·</span>
            <LanguageSwitcher tone="dark" />
            <span aria-hidden>·</span>
            <span>{intlTag[locale as keyof typeof intlTag]}</span>
            <span aria-hidden>·</span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-white transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
