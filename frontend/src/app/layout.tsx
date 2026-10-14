import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LASIN Cursos | Laboratorio Superior de Informática',
    template: '%s | LASIN',
  },
  description:
    'Descubre cursos de alta calidad en el Laboratorio Superior de Informática - UMSA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        {children}
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}