import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fresh Court',
  description: 'Find nearby tennis players, book courts, and connect with coaches.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
