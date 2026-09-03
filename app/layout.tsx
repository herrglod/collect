import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'GLOD — Collector Platform',
  description: 'The private collector platform of GLOD.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
