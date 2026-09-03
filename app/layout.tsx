import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'GLOD — Collector Platform',
  description: 'Private Sammler- und Admin-Plattform von GLOD.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
