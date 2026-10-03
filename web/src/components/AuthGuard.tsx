'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getToken } from '@/lib/auth';

// Paths are compared without the locale prefix: next-intl's usePathname turns
// /es/login into /login, and its router adds the prefix back on navigation.
const PUBLIC_PREFIXES = ['/login', '/register', '/invitations/', '/privacy', '/terms', '/cookies'];

function isPublicPath(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');
  const isPublic = isPublicPath(pathname);
  const [ready, setReady] = useState(isPublic);

  useEffect(() => {
    const token = getToken();
    const isLoginOrRegister = pathname === '/login' || pathname === '/register';

    if (!isPublic && !token) {
      router.replace('/login');
      return;
    }
    if (isLoginOrRegister && token) {
      router.replace('/app');
      return;
    }
    setReady(true);
  }, [pathname, router, isPublic]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-500 text-sm">
        {t('loading')}
      </div>
    );
  }

  return <>{children}</>;
}
