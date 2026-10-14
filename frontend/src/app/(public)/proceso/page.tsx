import Link from 'next/link';
import { Sora } from 'next/font/google';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  MailCheck,
  MessageCircle,
  QrCode,
  Upload,
} from 'lucide-react';
import { Reveal } from '@/components/home/Reveal';
import { whatsappLink } from '@/lib/utils/constants';
import '../home.css';

const display = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Proceso de inscripción | LASIN',
  description:
    'Conoce los pasos para preinscribirte a un curso del LASIN: formulario, pago con QR, comprobante y confirmación.',
};

const pasos = [
  {
    icon: FileText,
    titulo: 'Elige tu curso y llena el formulario',
    texto:
      'Entra a la sección Cursos, abre el curso que te interesa y completa tus datos personales en el formulario de preinscripción.',
    detalle: ['Nombres y apellidos', 'Correo electrónico', 'CI y teléfono'],
    color: 'from-indigo-500 to-cyan-500',
  },
  {
    icon: QrCode,
    titulo: 'Realiza el pago con QR',
    texto:
      'Escanea el código QR con la aplicación de tu banco y paga el costo del curso (el monto aparece en la tarjeta del curso).',
    detalle: ['Desde tu aplicación bancaria', 'Guarda la captura del pago'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Upload,
    titulo: 'Sube tu comprobante',
    texto:
      'Adjunta la captura o el PDF de tu comprobante en el mismo formulario para que podamos verificar tu pago.',
    detalle: ['Formatos JPG, PNG, WEBP o PDF', 'Tamaño máximo 5 MB'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: MailCheck,
    titulo: 'Recibe tu confirmación',
    texto:
      'Revisamos tu comprobante y te enviamos un correo confirmando si tu inscripción fue aceptada, normalmente en 24 a 48 horas.',
    detalle: ['Revisa también tu carpeta de spam', 'Con tu aceptación quedas inscrito'],
    color: 'from-emerald-500 to-teal-500',
  },
];

const preguntas = [
  {
    q: '¿Cuándo quedo inscrito?',
    a: 'Cuando verificamos tu comprobante y tu preinscripción pasa a estado «aceptado». Te avisamos por correo.',
  },
  {
    q: '¿Puedo preinscribirme a más de un curso?',
    a: 'Sí. Cada curso requiere su propio formulario y su propio comprobante de pago.',
  },
  {
    q: '¿Qué pasa si me equivoqué en mis datos?',
    a: 'Escríbenos por WhatsApp indicando tu nombre y el curso, y te ayudamos a corregirlo.',
  },
];

export default function ProcesoPage() {
  return (
    <div className="pb-24">
      {/* ============ ENCABEZADO ============ */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="lasin-float absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="lasin-float-reverse absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-brand-accent/15 blur-3xl" />

        <div className="container-custom relative text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary mb-4">
            Cómo inscribirte
          </p>
          <h1
            className={`${display.className} text-4xl md:text-6xl font-extrabold leading-tight mb-6`}
          >
            Proceso de{' '}
            <span className="lasin-gradient-animated">inscripción</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
            Es rápido, 100% en línea y solo toma 4 pasos. Elige tu curso,
            paga, sube tu comprobante y espera nuestra confirmación.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              href="/cursos"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-brand text-white font-bold text-lg shadow-xl shadow-brand-primary/30 hover:scale-105 transition-transform"
            >
              Preinscribirme ahora
              <ArrowRight size={20} />
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-emerald-500/60 text-emerald-400 font-bold text-lg hover:bg-emerald-500/10 hover:scale-105 transition-all"
            >
              <MessageCircle size={20} />
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ============ PASOS ============ */}
      <section className="container-custom">
        <div className="max-w-4xl mx-auto relative">
          <div className="hidden md:block absolute left-[39px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-brand-primary via-brand-accent to-transparent opacity-40" />

          <div className="space-y-8">
            {pasos.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 100}>
                <div className="relative flex flex-col md:flex-row gap-5 md:gap-8">
                  <div
                    className={`${display.className} relative z-10 shrink-0 w-20 h-20 rounded-3xl bg-gradient-to-br ${p.color} grid place-items-center text-3xl font-extrabold text-white shadow-xl`}
                  >
                    {i + 1}
                  </div>

                  <div className="lasin-card glass flex-1 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <p.icon size={24} className="text-brand-primary" />
                      <h2
                        className={`${display.className} text-xl md:text-2xl font-bold text-text-primary`}
                      >
                        {p.titulo}
                      </h2>
                    </div>
                    <p className="text-text-secondary leading-relaxed mb-4">
                      {p.texto}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {p.detalle.map((d) => (
                        <li
                          key={d}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 text-sm font-semibold text-text-secondary"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400"
                          />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center mt-12">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/15 text-amber-500 font-bold uppercase tracking-wider text-sm lasin-pulse-ring">
              <Clock size={16} />
              Cupos limitados
            </span>
          </Reveal>
        </div>
      </section>

      {/* ============ PREGUNTAS FRECUENTES ============ */}
      <section className="container-custom mt-24">
        <Reveal className="text-center mb-10">
          <h2
            className={`${display.className} text-3xl md:text-4xl font-extrabold`}
          >
            Preguntas <span className="lasin-gradient-animated">frecuentes</span>
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
          {preguntas.map((f, i) => (
            <Reveal key={f.q} delay={i * 100}>
              <div className="glass rounded-2xl p-6 h-full">
                <p className="flex items-start gap-2 font-bold text-text-primary mb-2">
                  <Info size={18} className="text-brand-primary mt-0.5 shrink-0" />
                  {f.q}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {f.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="container-custom mt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] gradient-brand p-10 md:p-14 text-center shadow-2xl">
            <div className="lasin-float absolute -top-16 -right-16 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <h2
                className={`${display.className} text-3xl md:text-4xl font-extrabold text-white mb-4`}
              >
                ¿Listo para empezar?
              </h2>
              <p className="text-white/85 max-w-xl mx-auto mb-8">
                Elige tu curso y completa tu preinscripción ahora, o escríbenos
                si tienes alguna duda antes de inscribirte.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/cursos"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-primary font-bold text-lg shadow-xl hover:scale-105 transition-all"
                >
                  Preinscribirme ahora
                  <ArrowRight size={20} />
                </Link>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/70 text-white font-bold text-lg hover:bg-white/15 hover:scale-105 transition-all"
                >
                  <MessageCircle size={20} />
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
