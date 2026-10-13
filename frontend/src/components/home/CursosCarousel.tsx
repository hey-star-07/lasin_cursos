'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Children,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CursosCarouselProps {
  children: ReactNode;
  /** Milisegundos entre avances automáticos (0 = sin autoplay) */
  autoplay?: number;
}

/** Carrusel con scroll-snap, flechas, puntos y autoplay (se pausa al pasar el mouse). */
export function CursosCarousel({ children, autoplay = 4500 }: CursosCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = Children.toArray(children);
  const total = slides.length;

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[index] as HTMLElement | undefined;
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }, []);

  const next = useCallback(() => goTo((active + 1) % total), [active, total, goTo]);
  const prev = useCallback(() => goTo((active - 1 + total) % total), [active, total, goTo]);

  // Detecta qué tarjeta está más cerca del inicio para marcar el punto activo
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      let closest = 0;
      let min = Infinity;
      Array.from(track.children).forEach((child, i) => {
        const dist = Math.abs((child as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft);
        if (dist < min) {
          min = dist;
          closest = i;
        }
      });
      setActive(closest);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!autoplay || paused || total < 2) return;
    const id = setInterval(next, autoplay);
    return () => clearInterval(id);
  }, [autoplay, paused, next, total]);

  if (total === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="lasin-carousel-track flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1 py-6"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`snap-start shrink-0 w-[85%] sm:w-[46%] lg:w-[31.5%] transition-all duration-500 ${
              i === active ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-80'
            }`}
          >
            {/* Cada slide reutiliza la tarjeta original, forzada a 1 columna */}
            <div className="lasin-card rounded-3xl h-full [&>*]:!grid-cols-1 hover:-translate-y-2 transition-transform duration-500">
              {slide}
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Curso anterior"
            className="hidden md:grid absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 place-items-center rounded-full glass shadow-xl hover:scale-110 hover:bg-brand-primary hover:text-white transition-all"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Curso siguiente"
            className="hidden md:grid absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 place-items-center rounded-full glass shadow-xl hover:scale-110 hover:bg-brand-primary hover:text-white transition-all"
          >
            <ChevronRight size={22} />
          </button>

          <div className="flex justify-center gap-2 mt-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al curso ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-8 bg-brand-primary'
                    : 'w-2 bg-text-muted/40 hover:bg-text-muted'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}