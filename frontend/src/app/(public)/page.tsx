import Link from 'next/link';
import { Sora } from 'next/font/google';
import {
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Sparkles,
  GraduationCap,
  HeartHandshake,
  MapPin,
  MessageCircle,
  FileText,
  QrCode,
  Upload,
  MailCheck,
  Clock,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CursoGrid } from '@/components/cursos/CursoGrid';
import { cursosApi } from '@/lib/api/cursos.api';
import { Reveal } from '@/components/home/Reveal';
import { CursosCarousel } from '@/components/home/CursosCarousel';
import './home.css';

// Tipografía de títulos (solo visual)
const display = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

export const revalidate = 60; // ISR cada 60 segundos

const URL_CONTACTO = 'https://lasin.fcpn.edu.bo/contact/';
const URL_WHATSAPP = 'https://wa.me/59177862862';

const ventajas = [
  {
    icon: GraduationCap,
    titulo: 'Formación de Calidad',
    texto:
      'En LASIN, nos comprometemos a ofrecer únicamente la mejor educación en informática, facilitando el acceso a recursos tecnológicos de última generación y un entorno de aprendizaje efectivo.',
    color: 'from-indigo-500 to-cyan-500',
  },
  {
    icon: HeartHandshake,
    titulo: 'Soporte Personalizado',
    texto:
      'Proporcionamos atención individualizada a nuestros estudiantes, ayudándolos a superar desafíos específicos y a alcanzar sus objetivos académicos y profesionales.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    titulo: 'Únete a nuestra comunidad',
    texto:
      'Inscríbete en nuestros cursos y talleres para desarrollar tus habilidades en informática y avanzar en tu carrera profesional.',
    color: 'from-amber-500 to-orange-500',
  },
];

const pasos = [
  {
    icon: FileText,
    titulo: 'Llena el Formulario',
    texto: 'Completa tus datos personales y selecciona el curso de tu interés.',
  },
  {
    icon: QrCode,
    titulo: 'Paga con QR',
    texto:
      'Realiza el pago escaneando el código QR con tu aplicación bancaria.',
  },
  {
    icon: Upload,
    titulo: 'Sube tu Comprobante',
    texto: 'Adjunta la captura de tu pago en el formulario para verificación.',
  },
  {
    icon: MailCheck,
    titulo: 'Recibe Confirmación',
    texto:
      'Te enviaremos un correo confirmando tu inscripción en 24-48 horas.',
  },
];

const insignias = [
  'Certificación Oficial UMSA',
  '+2,500 Egresados Exitosos',
  '25+ Años de Experiencia',
  'Clases 100% Prácticas',
];

export default async function HomePage() {
  let cursos: Awaited<ReturnType<typeof cursosApi.listar>> = [];
  try {
    cursos = await cursosApi.listar({ publicado: true });
  } catch {
    cursos = [];
  }
  const cursosDestacados = cursos.slice(0, 6);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="lasin-grid-move absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:45px_45px]" />
        <div className="lasin-float absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full bg-brand-primary/25 blur-3xl" />
        <div className="lasin-float-reverse absolute -bottom-40 -left-40 w-[650px] h-[650px] rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="lasin-float absolute top-1/3 left-[8%] w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400/40 to-indigo-500/40 blur-sm rotate-12 hidden md:block" />
        <div className="lasin-float-reverse absolute bottom-1/4 right-[10%] w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/50 to-pink-500/40 blur-sm hidden md:block" />
        <div className="lasin-orbit absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-dashed border-brand-primary/15 hidden lg:block" />

        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-8 lasin-pulse-ring">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Inscripciones Abiertas
              </span>
            </div>

            <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">
              Bienvenido al LASIN
            </p>

            <h1
              className={`${display.className} text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8`}
            >
              <span className="block text-text-primary lasin-title-3d">
                Transforma tu
              </span>
              <span className="block lasin-gradient-3d">
                <span className="lasin-gradient-animated">
                  Futuro Profesional
                </span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
              Nuestro laboratorio de informática ofrece formación y recursos de
              vanguardia para estudiantes y profesionales en la UMSA.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/cursos">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                >
                  Ver Cursos
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
              {[
                { value: `${cursos.length}+`, label: 'Cursos', icon: BookOpen },
                { value: '100%', label: 'Prácticos', icon: Award },
                { value: '2500+', label: 'Egresados', icon: Users },
                { value: '25+', label: 'Años', icon: Sparkles },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  style={{ animationDelay: `${i * 0.6}s` }}
                  className="lasin-card lasin-float glass rounded-3xl p-6 text-center hover:scale-110 transition-transform duration-300"
                >
                  <stat.icon
                    size={28}
                    className="mx-auto mb-3 text-brand-primary"
                  />
                  <p
                    className={`${display.className} text-4xl font-extrabold gradient-text`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm uppercase font-bold tracking-wider text-text-muted mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CINTA DE INSIGNIAS ============ */}
      <section className="lasin-marquee overflow-hidden border-y border-brand-primary/20 bg-gradient-to-r from-brand-primary/10 via-brand-accent/10 to-brand-primary/10 py-5">
        <div className="lasin-marquee-track">
          {[...insignias, ...insignias, ...insignias, ...insignias].map(
            (texto, i) => (
              <span
                key={i}
                className={`${display.className} mx-8 flex items-center gap-3 whitespace-nowrap text-lg font-bold text-text-primary`}
              >
                <Sparkles size={18} className="text-brand-primary" />
                {texto}
              </span>
            ),
          )}
        </div>
      </section>

      {/* ============ CURSOS DESTACADOS (CARRUSEL) ============ */}
      <section className="relative py-24 bg-bg-secondary/30 overflow-hidden">
        <div className="lasin-float absolute top-10 right-10 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="container-custom relative">
          <Reveal className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-primary mb-3">
              Nuestro Catálogo
            </p>
            <h2
              className={`${display.className} text-5xl md:text-6xl font-extrabold mb-5`}
            >
              Nuestros Cursos{' '}
              <span className="lasin-gradient-animated">Destacados</span>
            </h2>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
              Avanza en tu carrera con formaciones actualizadas y con demanda
              en el mercado tecnológico.
            </p>
          </Reveal>

          <Reveal delay={150}>
            {cursosDestacados.length > 0 ? (
              <CursosCarousel>
                {cursosDestacados.map((curso, i) => (
                  <CursoGrid key={i} cursos={[curso]} />
                ))}
              </CursosCarousel>
            ) : (
              <CursoGrid cursos={cursosDestacados} />
            )}
          </Reveal>

          {cursos.length > 6 && (
            <div className="text-center mt-12">
              <Link href="/cursos">
                <Button
                  variant="outline"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                >
                  Ver todos los cursos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============ POR QUÉ ELEGIR LASIN ============ */}
      <section className="relative py-24 overflow-hidden">
        <div className="lasin-float-reverse absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="container-custom relative">
          <Reveal className="text-center mb-16">
            <h2
              className={`${display.className} text-4xl md:text-6xl font-extrabold mb-5 leading-tight`}
            >
              Por qué elegir{' '}
              <span className="lasin-gradient-animated">Lasin</span> para tu
              formación en informática
            </h2>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Nuestra formación se basa en la experiencia práctica y un
              enfoque centrado en el alumno, preparando a los estudiantes para
              los retos del mundo tecnológico.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {ventajas.map((v, i) => (
              <Reveal key={v.titulo} delay={i * 150}>
                <div className="lasin-card glass rounded-3xl p-8 h-full hover:-translate-y-3 transition-transform duration-500">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${v.color} grid place-items-center mb-6 shadow-lg rotate-3 hover:rotate-12 transition-transform`}
                  >
                    <v.icon size={30} className="text-white" />
                  </div>
                  <h3
                    className={`${display.className} text-2xl font-bold mb-3 text-text-primary`}
                  >
                    {v.titulo}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {v.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HISTORIA ============ */}
      <section className="py-24 bg-bg-secondary/30">
        <div className="container-custom">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-primary mb-3">
              Desde 1973
            </p>
            <h2
              className={`${display.className} text-4xl md:text-6xl font-extrabold`}
            >
              La historia de{' '}
              <span className="lasin-gradient-animated">LASIN</span> y su
              impacto
            </h2>
          </Reveal>

          <div className="relative lasin-timeline max-w-4xl mx-auto space-y-10 pl-14">
            <Reveal>
              <div className="relative">
                <span className="absolute -left-14 top-1 w-10 h-10 rounded-full gradient-brand grid place-items-center text-white shadow-lg">
                  <Landmark size={18} />
                </span>
                <div className="lasin-card glass rounded-3xl p-8">
                  <p className="text-sm font-bold uppercase tracking-wider text-brand-primary mb-2">
                    1973 – 1983
                  </p>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    La formación en Informática en la Universidad Mayor de San
                    Andrés se inicia en 1973, cuando se crean las menciones de
                    Estadística e Informática dentro del Departamento de
                    Matemática. Con el crecimiento del interés por las
                    tecnologías, en 1983 la mención de Informática se
                    independiza, dando origen a la Carrera de Informática,
                    consolidándose como una respuesta a la creciente demanda
                    académica y profesional en el área.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative">
                <span className="absolute -left-14 top-1 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 grid place-items-center text-white shadow-lg">
                  <Sparkles size={18} />
                </span>
                <div className="lasin-card glass rounded-3xl p-8">
                  <p className="text-sm font-bold uppercase tracking-wider text-brand-primary mb-2">
                    Nace el LASIN
                  </p>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    En este contexto surge el Laboratorio Superior en
                    Informática (LASIN), que se convirtió en un pilar
                    fundamental para la formación práctica de los estudiantes,
                    evolucionando junto con los avances tecnológicos. Desde la
                    incorporación de los primeros ordenadores hasta la
                    implementación de cursos especializados en programación,
                    bases de datos y ofimática, el LASIN ha ampliado su
                    alcance, brindando capacitación tanto a la comunidad
                    universitaria como al público en general.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ UBICACIÓN ============ */}
      <section className="py-24">
        <div className="container-custom">
          <Reveal className="text-center mb-12">
            <h2
              className={`${display.className} text-4xl md:text-6xl font-extrabold flex items-center justify-center gap-4 flex-wrap`}
            >
              <MapPin className="text-brand-primary" size={44} />
              ¡ Nuestra <span className="lasin-gradient-animated">Ubicación</span> !
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <div className="lasin-card glass rounded-3xl p-3 md:p-4 max-w-5xl mx-auto">
              <iframe
                title="Ubicación del LASIN en la UMSA"
                src="https://www.google.com/maps?q=Laboratorio+Superior+de+Inform%C3%A1tica+UMSA+La+Paz+Bolivia&output=embed"
                className="w-full h-[380px] md:h-[460px] rounded-2xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ INSCRIPCIÓN EN 4 PASOS ============ */}
      <section className="relative py-24 bg-bg-secondary/30 overflow-hidden">
        <div className="lasin-float absolute top-20 -left-20 w-80 h-80 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="container-custom relative">
          <Reveal className="text-center mb-16">
            <h2
              className={`${display.className} text-4xl md:text-6xl font-extrabold mb-4`}
            >
              Inscripción en{' '}
              <span className="lasin-gradient-animated">4 Pasos</span>
            </h2>
            <p className="text-lg md:text-xl text-text-secondary">
              Proceso rápido, seguro y 100% en línea. Comienza hoy mismo.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary opacity-40" />
            {pasos.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 130}>
                <div className="lasin-card glass rounded-3xl p-7 text-center h-full hover:-translate-y-3 transition-transform duration-500 relative">
                  <div
                    className={`${display.className} mx-auto w-16 h-16 rounded-2xl gradient-brand grid place-items-center text-3xl font-extrabold text-white shadow-xl mb-5 relative z-10`}
                  >
                    {i + 1}
                  </div>
                  <p.icon size={28} className="mx-auto mb-3 text-brand-primary" />
                  <h3
                    className={`${display.className} text-xl font-bold mb-2 text-text-primary`}
                  >
                    {p.titulo}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {p.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center mt-12">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/15 text-amber-500 font-bold uppercase tracking-wider text-sm lasin-pulse-ring">
              <Clock size={16} />
              Cupos Limitados
            </span>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="py-24">
        <div className="container-custom">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] gradient-brand p-10 md:p-20 text-center shadow-2xl">
              <div className="lasin-float absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
              <div className="lasin-float-reverse absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
              <div className="lasin-orbit absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-dashed border-white/20" />

              <div className="relative z-10">
                <h2
                  className={`${display.className} text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight`}
                >
                  ¿Listo para Transformar tu Futuro?
                </h2>
                <p
                  className={`${display.className} text-xl md:text-2xl font-semibold text-white/90 mb-5`}
                >
                  Únete a la comunidad de profesionales más grande de Bolivia
                </p>
                <p className="text-lg text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
                  En el LASIN no solo enseñamos tecnología, formamos líderes
                  capaces de innovar y crear el futuro. Tu carrera profesional
                  comienza aquí, con educación de calidad y certificación
                  oficial.
                </p>

                <p className="text-sm uppercase tracking-[0.25em] font-bold text-white/70 mb-8">
                  LASIN · Laboratorio Superior de Informática · Carrera de
                  Informática · UMSA
                </p>

                <div className="flex flex-wrap gap-4 justify-center mb-12">
                  <a
                    href={URL_CONTACTO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-primary font-bold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all"
                  >
                    Preinscribirme Ahora
                    <ArrowRight size={20} />
                  </a>
                  <a
                    href={URL_WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/70 text-white font-bold text-lg hover:bg-white/15 hover:scale-105 transition-all"
                  >
                    <MessageCircle size={20} />
                    Contactar por WhatsApp
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {insignias.map((texto) => (
                    <div
                      key={texto}
                      className="rounded-2xl bg-white/10 backdrop-blur px-4 py-4 text-sm md:text-base font-bold text-white hover:bg-white/20 transition-colors"
                    >
                      {texto}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ COPYRIGHT ============ */}
      <p className="pb-10 text-center text-sm text-text-muted">
        Derechos de autor © 2026 Laboratorio Superior de Informática
      </p>
    </>
  );
}