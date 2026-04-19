import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Registra tu cuenta y tu equipo en Invoice Generator.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/register' },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
