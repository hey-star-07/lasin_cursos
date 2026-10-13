import { Sora } from 'next/font/google';

/** Tipografía de títulos compartida por las pantallas de admin (solo visual). */
export const display = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});