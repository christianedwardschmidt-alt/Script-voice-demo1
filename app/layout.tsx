import type { Metadata, Viewport } from 'next';
import { Sora, Manrope } from 'next/font/google';
import './globals.css';

const sora = Sora({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-sora' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Trainer',
  description: 'Manage client communication, live video coaching, scheduling, and progress tracking.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0c0c10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
