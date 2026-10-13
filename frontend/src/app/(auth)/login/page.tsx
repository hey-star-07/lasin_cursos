'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { loginSchema, type LoginFormInput } from '@/lib/schemas/auth.schema';
import { useAuth } from '@/hooks/useAuth';

/**
 * Imagen del panel izquierdo.
 * Guárdala en: public/images/login-lasin.jpg
 * Si el archivo no existe, el panel se ve igual (solo con el fondo azul).
 */
const LOGIN_IMAGE = '/images/login-lasin.jpg';

const AREAS = [
  'Python',
  'Excel',
  'Visualización de datos con Power BI',
  'Docker',
  'Desarrollo web full stack',
];

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-umsa-red shadow-lg shadow-umsa-red/30">
        <GraduationCap size={22} className="text-white" />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight text-white">
          LASIN
        </span>
        <span className="block text-xs text-white/70">
          Laboratorio Superior de Informática, UMSA
        </span>
      </span>
    </Link>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
  });

  // Redirigir si ya está logueado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: LoginFormInput) => {
    try {
      setSubmitting(true);
      setServerError(null);
      await login(data.email, data.password);
      toast.success('¡Bienvenido!');
      router.push('/admin/dashboard');
    } catch (error) {
      const raw = error instanceof Error ? error.message : '';
      setServerError(
        raw === 'Network Error' || raw === ''
          ? 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
          : raw
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'w-full rounded-xl border bg-white py-3 pl-11 text-slate-900 placeholder:text-slate-400 ' +
    'transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';
  const inputOk =
    'border-slate-300 focus:border-navy-700 focus:ring-navy-700/15';
  const inputBad = 'border-red-500 focus:border-red-500 focus:ring-red-500/15';

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* ===== PANEL IZQUIERDO (solo escritorio) ===== */}
      <aside className="gradient-navy relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-16">
        <Image
          src={LOGIN_IMAGE}
          alt=""
          fill
          sizes="55vw"
          className="object-cover opacity-45 mix-blend-luminosity"
        />
        {/* El fondo baja y se funde con el azul */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/75 to-navy-900/25" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-umsa-red/25 blur-3xl" />

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-lg">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
            Cursos de informática con práctica real.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
            Desde este panel administras los cursos, revisas las
            preinscripciones y confirmas a los estudiantes.
          </p>

          <ul className="mt-10 space-y-3">
            {AREAS.map((area) => (
              <li
                key={area}
                className="flex items-center gap-3 text-sm font-medium text-white/90"
              >
                <span className="h-2 w-2 shrink-0 rounded-sm bg-umsa-red" />
                {area}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Universidad Mayor de San Andrés
        </p>
      </aside>

      {/* ===== PANEL DERECHO: FORMULARIO ===== */}
      <section className="flex min-h-screen flex-col bg-white lg:min-h-0">
        {/* Cabecera móvil */}
        <div className="gradient-navy px-6 py-5 lg:hidden">
          <Brand />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-navy-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-700/15"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>

            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
              Ingresa a tu panel
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Usa el correo y la contraseña de tu cuenta de administrador.
            </p>

            {serverError && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
              noValidate
            >
              {/* Correo */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`${inputBase} pr-4 ${
                      errors.email ? inputBad : inputOk
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
                    className={`${inputBase} pr-12 ${
                      errors.password ? inputBad : inputOk
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-navy-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-700/15"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-umsa-red px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-umsa-red/25 transition hover:bg-umsa-red-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-umsa-red/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar al panel'
                )}
              </button>
            </form>

            <p className="mt-8 text-xs leading-relaxed text-slate-500">
              Este acceso es solo para el personal autorizado del LASIN. Si no
              puedes ingresar, pide ayuda al administrador del sistema.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}