'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

const PUBLIC_PREFIXES = ['/login', '/register', '/invitations/'];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = isPublicPath(pathname);
    const token = getToken();
    const isLoginOrRegister = pathname === '/login' || pathname === '/register';

    if (!isPublic && !token) {
      router.replace('/login');
      return;
    }
    if (isLoginOrRegister && token) {
      router.replace('/');
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-500 text-sm">
        Cargando…
      </div>
    );
  }

  return <>{children}</>;
}
