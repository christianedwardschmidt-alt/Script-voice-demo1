import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Table',
  description: 'Pull up a chair — find your next board game night.',
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
