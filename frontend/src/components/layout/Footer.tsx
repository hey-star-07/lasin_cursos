import Link from 'next/link';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer
      id="contacto"
      className="bg-bg-primary border-t border-border mt-auto"
    >
      <div className="container-custom py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Marca */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="text-xl font-black text-text-primary">
                LASIN
              </span>
            </div>
            <p className="text-sm text-text-secondary max-w-md leading-relaxed">
              Laboratorio Superior de Informática de la Carrera de Informática
              - UMSA. Formamos profesionales con cursos de alta calidad,
              certificación oficial e instructores expertos.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">
              Explorar
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/cursos', label: 'Cursos' },
                { href: '/login', label: 'Iniciar Sesión' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone size={16} className="text-brand-primary flex-shrink-0" />
                +591 77862862
              </li>
              <li className="flex items-start gap-2 text-sm text-text-secondary">
                <MapPin
                  size={16}
                  className="text-brand-primary flex-shrink-0 mt-0.5"
                />
                UMSA, Campus Universitario, La Paz
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} LASIN — Todos los derechos reservados.
          </p>
          <p className="text-xs text-text-muted">
            Universidad Mayor de San Andrés
          </p>
        </div>
      </div>
    </footer>
  );
}