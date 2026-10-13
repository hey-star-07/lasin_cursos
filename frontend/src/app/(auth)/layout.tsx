import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión | LASIN',
  description: 'Acceso al panel administrativo del Laboratorio Superior de Informática.',
};

// El login ocupa toda la pantalla, así que el layout solo entrega el contenido.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}