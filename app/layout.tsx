import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Huddle',
  description: 'Where sports fans connect, talk trash, and share hot takes.',
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
