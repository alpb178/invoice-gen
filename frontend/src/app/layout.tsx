// src/app/layout.tsx
//
// The real root layout is app/[locale]/layout.tsx, which renders <html lang>.
// This one only exists because app/not-found.tsx lives at the root, and Next
// needs a layout above it.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
