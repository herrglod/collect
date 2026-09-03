import './globals.css';
import type { ReactNode } from 'react';
import Footer from './components/Footer';

export const metadata = {
  title: 'GLOD — Collector Platform',
  description: 'The private collector platform of GLOD.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
