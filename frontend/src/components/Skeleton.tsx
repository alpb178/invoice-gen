// src/components/Skeleton.tsx
// Primitivas de skeleton reutilizables. Todas usan `animate-pulse` de Tailwind
// y tonos `ink-100/200` para integrarse con el resto de la UI sin configuración
// extra. Úsalas en lugar del típico placeholder "Cargando..." cuando la vista
// está esperando datos de la API.

import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-ink-100 rounded-md animate-pulse ${className}`}
    />
  );
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return <Skeleton className={`h-3 w-full ${className}`} />;
}

export function SkeletonCard({ children, className = '' }: SkeletonProps & { children?: ReactNode }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`bg-paper border border-ink-200 rounded-2xl p-5 shadow-card ${className}`}
    >
      {children ?? (
        <>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32 mt-2" />
          <Skeleton className="h-3 w-40 mt-3" />
        </>
      )}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div
      aria-busy="true"
      className="bg-paper border border-ink-200 rounded-2xl p-5 flex items-center justify-between shadow-card"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-7 w-28 mt-3" />
          <Skeleton className="h-2.5 w-32 mt-3" />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function SkeletonInvoiceEditor() {
  return (
    <div aria-busy="true" className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <SkeletonCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton className="h-4 w-32" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
