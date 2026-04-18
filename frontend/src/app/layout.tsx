// src/app/layout.tsx
import type { Metadata } from 'next';
import AuthGuard from '@/components/AuthGuard';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Invoice Generator - Crea y gestiona facturas profesionales online',
    template: '%s | Invoice Generator',
  },
  description:
    'Crea, personaliza y descarga facturas profesionales en PDF de forma rápida y sencilla. Gestiona clientes, equipos y facturación multi-sección en un solo lugar.',
  keywords: [
    'generador de facturas',
    'crear facturas online',
    'facturación',
    'facturas PDF',
    'invoice generator',
    'facturas profesionales',
    'software de facturación',
    'gestión de facturas',
  ],
  authors: [{ name: 'Invoice Generator' }],
  creator: 'Invoice Generator',
  publisher: 'Invoice Generator',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    title: 'Invoice Generator - Crea y gestiona facturas profesionales online',
    description:
      'Crea, personaliza y descarga facturas profesionales en PDF de forma rápida y sencilla. Gestiona clientes, equipos y facturación multi-sección en un solo lugar.',
    siteName: 'Invoice Generator',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Invoice Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoice Generator - Crea y gestiona facturas profesionales online',
    description:
      'Crea, personaliza y descarga facturas profesionales en PDF de forma rápida y sencilla.',
    images: ['/icon.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-paper text-ink-900 antialiased">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
