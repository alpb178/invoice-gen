import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';

// Shared by the locale layout and the root not-found page, which renders its
// own <html>.
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const fontVariables = `${dmSans.variable} ${fraunces.variable} ${mono.variable}`;
