'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en milisegundos para escalonar animaciones */
  delay?: number;
}

/** Hace aparecer el contenido con una animación al entrar en pantalla. */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lasin-reveal ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}