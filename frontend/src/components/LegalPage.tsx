import Link from 'next/link';
import type { ReactNode } from 'react';

export type LegalSection = {
  heading: string;
  body: ReactNode;
};

type Props = {
  eyebrow?: string;
  title: string;
  updatedAt: string;
  summary?: string;
  sections: LegalSection[];
};

export default function LegalPage({ eyebrow, title, updatedAt, summary, sections }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-5 md:px-8 py-14 md:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-900 font-mono-tight uppercase tracking-[0.18em] mb-8 transition-colors"
      >
        ← Volver al inicio
      </Link>

      {eyebrow && (
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 font-mono-tight mb-4">
          {eyebrow}
        </div>
      )}

      <h1 className="font-serif-display text-4xl md:text-5xl font-medium leading-[1.05] tracking-tight mb-4">
        {title}
      </h1>

      <p className="text-xs uppercase tracking-[0.18em] text-ink-500 font-mono-tight mb-8">
        Última actualización: {updatedAt}
      </p>

      {summary && (
        <p className="text-lg text-ink-700 leading-relaxed border-l-2 border-ink-300 pl-4 mb-12">
          {summary}
        </p>
      )}

      <div className="space-y-10 text-ink-800 leading-relaxed legal-prose">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-serif-display text-2xl font-medium mb-4 tracking-tight">
              {s.heading}
            </h2>
            <div className="space-y-4 text-[15px]">{s.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
