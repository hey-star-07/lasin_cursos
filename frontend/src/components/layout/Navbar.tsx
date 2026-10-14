'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, BookOpen, LogIn, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/proceso', label: 'Proceso' },
];

/** Indica si el enlace corresponde a la página donde está el usuario. */
function esActivo(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  // El detalle de un curso y el formulario de preinscripción cuentan como "Cursos"
  if (href === '/cursos') {
    return pathname.startsWith('/cursos') || pathname.startsWith('/preinscripcion');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-bg-primary/80 border-b border-border">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-primary/30 group-hover:scale-105 transition-transform">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-text-primary">
            LASIN
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const activo = esActivo(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group',
                  activo
                    ? 'text-white bg-brand-primary/20 border border-brand-primary/50 shadow-lg shadow-brand-primary/20'
                    : 'text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-secondary'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full gradient-brand transition-all duration-300',
                    activo ? 'opacity-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/admin/dashboard">
              <Button
                variant="primary"
                size="sm"
                icon={<LayoutDashboard size={16} />}
              >
                Panel
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" icon={<LogIn size={16} />}>
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 border-t border-border',
          open ? 'max-h-96' : 'max-h-0'
        )}
      >
        <nav className="container-custom py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const activo = esActivo(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'py-2.5 px-4 rounded-lg text-sm font-bold transition-colors border-l-4',
                  activo
                    ? 'bg-brand-primary/20 text-white border-brand-primary'
                    : 'border-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={isAuthenticated ? '/admin/dashboard' : '/login'}
            onClick={() => setOpen(false)}
            className="mt-2"
          >
            <Button variant="primary" size="sm" className="w-full">
              {isAuthenticated ? 'Panel' : 'Iniciar Sesión'}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}