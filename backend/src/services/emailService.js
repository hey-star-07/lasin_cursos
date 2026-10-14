import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter && env.SMTP_HOST && env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/* ============================================================
   DISEÑO DE CORREOS
   Gmail y Outlook ignoran flexbox, degradados y colores rgba,
   por eso todo está hecho con tablas y colores sólidos.
   ============================================================ */

const FUENTE =
  "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const COLORES = {
  marca: '#4F46E5',
  marcaOscuro: '#312E81',
  fondo: '#EEF2FF',
  texto: '#1E293B',
  suave: '#64748B',
  borde: '#E2E8F0',
  pendiente: { fuerte: '#B45309', suave: '#FEF3C7', borde: '#FCD34D' },
  aceptado: { fuerte: '#047857', suave: '#D1FAE5', borde: '#6EE7B7' },
  rechazado: { fuerte: '#B91C1C', suave: '#FEE2E2', borde: '#FCA5A5' },
  info: { fuerte: '#4338CA', suave: '#EEF2FF', borde: '#C7D2FE' },
  whatsapp: { fuerte: '#128C7E', suave: '#DCFCE7', borde: '#86EFAC' },
};

// Evita que texto escrito por usuarios rompa el HTML del correo
const esc = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const escMultilinea = (valor) => esc(valor).replace(/\r?\n/g, '<br>');

const formatearFecha = (fecha) => {
  if (!fecha) return 'Por definir';
  const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return new Date(fecha).toLocaleDateString('es-BO');
};

const formatearMonto = (costo) =>
  costo ? `Bs. ${Number(costo).toFixed(2)}` : 'Consultar';

/** Estructura general del correo */
const emailTemplate = ({ preheader, estado, titulo, contenido }) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(titulo)}</title>
</head>
<body style="margin:0; padding:0; background-color:${COLORES.fondo}; font-family:${FUENTE};">
  <!-- Texto de vista previa en la bandeja de entrada -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; font-size:1px; line-height:1px; color:${COLORES.fondo};">
    ${esc(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORES.fondo}" style="background-color:${COLORES.fondo};">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">

          <!-- Encabezado -->
          <tr>
            <td align="center" bgcolor="${COLORES.marca}" style="background-color:${COLORES.marca}; border-radius:16px 16px 0 0; padding:32px 24px;">
              <div style="font-family:${FUENTE}; font-size:30px; font-weight:800; letter-spacing:4px; color:#FFFFFF;">LASIN</div>
              <div style="font-family:${FUENTE}; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#C7D2FE; margin-top:6px;">
                Laboratorio Superior de Informática &middot; UMSA
              </div>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td bgcolor="#FFFFFF" style="background-color:#FFFFFF; padding:36px 32px 32px 32px; border-left:1px solid ${COLORES.borde}; border-right:1px solid ${COLORES.borde};">

              <!-- Estado -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="${estado.suave}" style="background-color:${estado.suave}; border:1px solid ${estado.borde}; border-radius:100px; padding:7px 16px; font-family:${FUENTE}; font-size:12px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:${estado.fuerte};">
                    ${estado.etiqueta}
                  </td>
                </tr>
              </table>

              <h1 style="font-family:${FUENTE}; font-size:26px; line-height:1.25; font-weight:800; color:${COLORES.texto}; margin:20px 0 20px 0;">
                ${esc(titulo)}
              </h1>

              ${contenido}
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td align="center" bgcolor="#F8FAFC" style="background-color:#F8FAFC; border:1px solid ${COLORES.borde}; border-radius:0 0 16px 16px; padding:24px; font-family:${FUENTE}; font-size:12px; line-height:1.7; color:${COLORES.suave};">
              <strong style="color:${COLORES.texto};">Laboratorio Superior de Informática</strong><br>
              Carrera de Informática &middot; Universidad Mayor de San Andrés<br>
              <span style="color:#94A3B8;">Este es un mensaje automático, por favor no respondas a este correo.</span>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

const parrafo = (html) => `
<p style="font-family:${FUENTE}; font-size:15px; line-height:1.7; color:${COLORES.texto}; margin:0 0 16px 0;">${html}</p>`;

/** Tabla de datos (etiqueta a la izquierda, valor a la derecha) */
const tablaInfo = (filas, tono = COLORES.info) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0; border:1px solid ${COLORES.borde}; border-radius:12px; border-collapse:separate; overflow:hidden;">
  ${filas
    .map(
      ([label, value], i) => `
  <tr>
    <td width="38%" valign="top" bgcolor="${tono.suave}" style="background-color:${tono.suave}; padding:13px 16px; ${i < filas.length - 1 ? `border-bottom:1px solid ${COLORES.borde};` : ''} font-family:${FUENTE}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:${tono.fuerte};">
      ${esc(label)}
    </td>
    <td valign="top" bgcolor="#FFFFFF" style="background-color:#FFFFFF; padding:13px 16px; ${i < filas.length - 1 ? `border-bottom:1px solid ${COLORES.borde};` : ''} font-family:${FUENTE}; font-size:15px; font-weight:600; color:${COLORES.texto};">
      ${esc(value)}
    </td>
  </tr>`
    )
    .join('')}
</table>`;

/** Recuadro de aviso con barra de color a la izquierda */
const aviso = (tono, titulo, htmlTexto) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
  <tr>
    <td width="5" bgcolor="${tono.fuerte}" style="background-color:${tono.fuerte}; border-radius:6px 0 0 6px; font-size:0; line-height:0;">&nbsp;</td>
    <td bgcolor="${tono.suave}" style="background-color:${tono.suave}; border-radius:0 10px 10px 0; padding:16px 18px; font-family:${FUENTE}; font-size:14px; line-height:1.65; color:${COLORES.texto};">
      ${titulo ? `<div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.6px; color:${tono.fuerte}; margin-bottom:6px;">${titulo}</div>` : ''}
      ${htmlTexto}
    </td>
  </tr>
</table>`;

/** Botón compatible con Gmail/Outlook */
const boton = (href, texto, color) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
  <tr>
    <td align="center" bgcolor="${color}" style="background-color:${color}; border-radius:10px;">
      <a href="${esc(href)}" target="_blank" style="display:inline-block; padding:14px 30px; font-family:${FUENTE}; font-size:14px; font-weight:800; letter-spacing:0.4px; color:#FFFFFF; text-decoration:none; border-radius:10px;">${texto}</a>
    </td>
  </tr>
</table>`;

const nombreCompleto = (p, conMaterno = false) =>
  [p.nombres, p.apellidoPaterno, conMaterno ? p.apellidoMaterno : '']
    .filter(Boolean)
    .join(' ');

const esUrlSegura = (url) => /^https?:\/\//i.test(String(url || ''));

/* ============================================================
   CORREOS
   ============================================================ */

export const sendConfirmationEmail = async (preinscripcion) => {
  const t = getTransporter();
  if (!t) {
    console.warn('SMTP no configurado, saltando email');
    return;
  }

  const c = preinscripcion.curso;

  const contenido = `
    ${parrafo(`Hola <strong>${esc(preinscripcion.nombres)}</strong>, recibimos tu preinscripción correctamente. Estos son los datos registrados:`)}
    ${tablaInfo([
      ['Curso', c.nombre],
      ['Monto', formatearMonto(c.costo)],
      ['Nombre', nombreCompleto(preinscripcion, true)],
    ])}
    ${aviso(
      COLORES.pendiente,
      '¿Qué sigue?',
      'Espera a que el administrador verifique tu comprobante de pago. Cuando esté revisado, recibirás un correo con la confirmación.'
    )}
  `;

  await t.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: preinscripcion.correo,
    subject: '📋 Preinscripción recibida',
    html: emailTemplate({
      preheader: `Recibimos tu preinscripción al curso ${c.nombre}. Estamos verificando tu pago.`,
      estado: { ...COLORES.pendiente, etiqueta: '⏳ Pendiente de revisión' },
      titulo: 'Preinscripción registrada',
      contenido,
    }),
  });
};

export const sendAceptadoEmail = async (preinscripcion, observacion) => {
  const t = getTransporter();
  if (!t) return;

  const c = preinscripcion.curso;
  const horario =
    c.horaInicio && c.horaFin ? `${c.horaInicio} - ${c.horaFin}` : 'Por definir';

  const whatsappBlock =
    c.enlaceWhatsapp && esUrlSegura(c.enlaceWhatsapp)
      ? aviso(
          COLORES.whatsapp,
          '📱 Grupo oficial de WhatsApp',
          `Únete al grupo del curso para recibir avisos, material y coordinar con tus compañeros.
           ${boton(c.enlaceWhatsapp, 'Unirme al grupo', '#128C7E')}`
        )
      : '';

  const detalle = observacion
    ? aviso(COLORES.info, 'Detalle', escMultilinea(observacion))
    : '';

  const contenido = `
    ${parrafo(`Hola <strong>${esc(preinscripcion.nombres)} ${esc(preinscripcion.apellidoPaterno)}</strong>,`)}
    ${parrafo(`¡Buenas noticias! Tu inscripción fue <strong style="color:${COLORES.aceptado.fuerte};">aprobada</strong>. Te esperamos en clases.`)}
    ${tablaInfo(
      [
        ['Curso', c.nombre],
        ['Modalidad', c.modalidad || 'N/A'],
        ['Inicio', formatearFecha(c.fechaInicio)],
        ['Fin', formatearFecha(c.fechaFin)],
        ['Horario', horario],
        ['Duración', c.duracion || 'N/A'],
        ['Inversión', formatearMonto(c.costo)],
      ],
      COLORES.aceptado
    )}
    ${whatsappBlock}
    ${detalle}
  `;

  await t.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: preinscripcion.correo,
    subject: `✅ Inscripción confirmada - ${c.nombre}`,
    html: emailTemplate({
      preheader: `Tu inscripción a ${c.nombre} fue aprobada. Inicio: ${formatearFecha(c.fechaInicio)}.`,
      estado: { ...COLORES.aceptado, etiqueta: '✅ Inscripción confirmada' },
      titulo: '¡Bienvenido al curso!',
      contenido,
    }),
  });
};

export const sendRechazadoEmail = async (preinscripcion, observacion) => {
  const t = getTransporter();
  if (!t) return;

  const c = preinscripcion.curso;

  const detalle = observacion
    ? aviso(COLORES.rechazado, 'Motivo', escMultilinea(observacion))
    : '';

  const contenido = `
    ${parrafo(`Hola <strong>${esc(preinscripcion.nombres)} ${esc(preinscripcion.apellidoPaterno)}</strong>,`)}
    ${parrafo(`Revisamos tu comprobante y lamentablemente fue <strong style="color:${COLORES.rechazado.fuerte};">rechazado</strong>.`)}
    ${tablaInfo([['Curso', c.nombre]], COLORES.rechazado)}
    ${detalle}
    ${aviso(
      COLORES.info,
      'Qué debes hacer',
      '🏢 Debes apersonarte al LASIN para regularizar tu inscripción.'
    )}
  `;

  await t.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: preinscripcion.correo,
    subject: `⚠️ Revisión de comprobante - ${c.nombre}`,
    html: emailTemplate({
      preheader: `Tu comprobante para ${c.nombre} necesita revisión. Contáctanos para regularizarlo.`,
      estado: { ...COLORES.rechazado, etiqueta: '⚠️ Comprobante observado' },
      titulo: 'Necesitamos revisar tu comprobante',
      contenido,
    }),
  });
};