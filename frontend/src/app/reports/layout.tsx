import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reportes',
  description: 'Reportes internos del equipo.',
  robots: { index: false, follow: false },
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
