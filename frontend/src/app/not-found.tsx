import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscas no existe o se movió.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-20"
      style={{ background: 'var(--cream)', color: '#18181b' }}
    >
      <div className="max-w-xl text-center">
        <div className="font-mono-tight text-[11px] uppercase tracking-[0.28em] text-ink-500 mb-6">
          Error · 404
        </div>
        <h1 className="font-serif-display text-6xl md:text-8xl font-medium leading-[1.02] tracking-tight">
          Aquí no <em className="italic font-normal">hay nada</em>.
        </h1>
        <p className="mt-6 text-lg text-ink-700 leading-relaxed">
          La página que buscas se mudó, fue renombrada o nunca existió. Volvamos al origen.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-950 text-[#f5f1e8] text-[15px] font-medium rounded-full hover:bg-ink-800 transition-all hover:gap-3"
          >
            Volver al inicio
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium text-ink-900 hover:text-ink-950 transition-colors border-b border-ink-900"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
