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

const emailTemplate = (titulo, badge, badgeColor, contenido) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #0f1421; padding: 20px; margin: 0; line-height: 1.6;">
  <div style="max-width: 550px; margin: 0 auto; background: linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,20,33,0.98) 100%); border-radius: 24px; padding: 40px 32px; border: 1px solid rgba(99,102,241,0.2); box-shadow: 0 30px 80px rgba(0,0,0,0.6);">
    <span style="display: inline-block; padding: 8px 16px; background: ${badgeColor}; border-radius: 100px; font-size: 11px; font-weight: 800; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 24px;">${badge}</span>
    <h2 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0 0 24px 0; letter-spacing: -0.02em;">${titulo}</h2>
    ${contenido}
    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; color: #64748B; font-size: 12px;">
      Laboratorio Superior de Informática<br>
      Este es un mensaje automático, no responder.
    </div>
  </div>
</body>
</html>
`;

const infoRow = (label, value) => `
<div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
  <span style="color: #64748B; font-size: 13px; font-weight: 600;">${label}</span>
  <span style="color: #FFFFFF; font-size: 15px; font-weight: 700; text-align: right;">${value}</span>
</div>
`;

export const sendConfirmationEmail = async (preinscripcion) => {
  const t = getTransporter();
  if (!t) {
    console.warn('SMTP no configurado, saltando email');
    return;
  }

  const cursoNombre = preinscripcion.curso.nombre;
  const monto = preinscripcion.curso.costo
    ? `Bs. ${Number(preinscripcion.curso.costo).toFixed(2)}`
    : 'Consultar';
  const nombreCompleto = `${preinscripcion.nombres} ${preinscripcion.apellidoPaterno} ${preinscripcion.apellidoMaterno || ''}`.trim();

  const contenido = `
    ${infoRow('Curso', cursoNombre)}
    ${infoRow('Monto', monto)}
    ${infoRow('Nombre', nombreCompleto)}
    <div style="margin-top: 28px; padding: 20px; background: rgba(99,102,241,0.1); border-radius: 16px; border-left: 4px solid #6366F1;">
      <p style="margin: 0; color: #94A3B8; font-size: 14px; line-height: 1.7;">
        Espere que el administrador compruebe su pago y recibirá un correo de confirmación.
      </p>
    </div>
  `;

  await t.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: preinscripcion.correo,
    subject: '📋 Preinscripción recibida',
    html: emailTemplate('Preinscripción llenada correctamente', '⏳ Pendiente', 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.2) 100%)', contenido),
  });
};

export const sendAceptadoEmail = async (preinscripcion, observacion) => {
  const t = getTransporter();
  if (!t) return;

  const c = preinscripcion.curso;
  const horario = c.horaInicio && c.horaFin ? `${c.horaInicio} - ${c.horaFin}` : 'Por definir';
  const monto = c.costo ? `Bs. ${Number(c.costo).toFixed(2)}` : 'Consultar';
  const nombre = `${preinscripcion.nombres} ${preinscripcion.apellidoPaterno}`;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Por definir';
    const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
    return new Date(fecha).toLocaleDateString('es-BO');
  };

  // Bloque de WhatsApp (solo si el curso tiene enlace)
  const whatsappBlock = c.enlaceWhatsapp
    ? `
      <div style="margin-top: 28px; padding: 24px; background: linear-gradient(135deg, rgba(37,211,102,0.15) 0%, rgba(18,140,126,0.1) 100%); border-radius: 16px; border: 2px solid rgba(37,211,102,0.4);">
        <p style="margin: 0 0 12px 0; color: #25D366; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;">
          📱 Grupo Oficial de WhatsApp
        </p>
        <p style="margin: 0 0 16px 0; color: #94A3B8; font-size: 14px; line-height: 1.6;">
          Únete al grupo oficial del curso para recibir avisos, material y coordinar con tus compañeros.
        </p>
        <a href="${c.enlaceWhatsapp}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          🚀 Unirme al Grupo
        </a>
      </div>
    `
    : '';

  const contenido = `
    <p style="color: #94A3B8; margin: 0 0 24px 0;">Hola <strong style="color: #FFFFFF;">${nombre}</strong>,</p>
    <p style="color: #94A3B8; margin: 0 0 24px 0;">Tu inscripción fue <span style="color: #10B981; font-weight: 700;">APROBADA</span>.</p>
    <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px; margin: 24px 0;">
      ${infoRow('Curso', c.nombre)}
      ${infoRow('Modalidad', c.modalidad || 'N/A')}
      ${infoRow('Inicio', formatearFecha(c.fechaInicio))}
      ${infoRow('Fin', formatearFecha(c.fechaFin))}
      ${infoRow('Horario', horario)}
      ${infoRow('Duración', c.duracion || 'N/A')}
      ${infoRow('Inversión', monto)}
    </div>
    ${whatsappBlock}
    ${observacion ? `
      <div style="margin-top: 24px; padding: 20px; background: rgba(99,102,241,0.1); border-radius: 16px; border-left: 4px solid #6366F1;">
        <p style="margin: 0; color: #94A3B8; font-size: 14px;"><strong style="color: #A5B4FC;">Detalle:</strong><br>${observacion}</p>
      </div>
    ` : ''}
  `;

  await t.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: preinscripcion.correo,
    subject: `✅ Inscripción confirmada - ${c.nombre}`,
    html: emailTemplate('Inscripción Confirmada', '✅ Confirmado', 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.2) 100%)', contenido),
  });
};

export const sendRechazadoEmail = async (preinscripcion, observacion) => {
  const t = getTransporter();
  if (!t) return;

  const c = preinscripcion.curso;
  const nombre = `${preinscripcion.nombres} ${preinscripcion.apellidoPaterno}`;

  const contenido = `
    <p style="color: #94A3B8; margin: 0 0 24px 0;">Hola <strong style="color: #FFFFFF;">${nombre}</strong>,</p>
    <p style="color: #94A3B8; margin: 0 0 24px 0;">Tu comprobante fue <span style="color: #EF4444; font-weight: 700;">RECHAZADO</span>.</p>
    <div style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 16px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0; color: #94A3B8; font-size: 14px;"><strong style="color: #A5B4FC;">Curso:</strong> ${c.nombre}</p>
    </div>
    ${observacion ? `
      <div style="margin-top: 24px; padding: 20px; background: rgba(239,68,68,0.1); border-radius: 16px; border-left: 4px solid #EF4444;">
        <p style="margin: 0; color: #94A3B8; font-size: 14px;"><strong style="color: #FCA5A5;">Detalle:</strong><br>${observacion}</p>
      </div>
    ` : ''}
    <div style="margin-top: 28px; padding: 20px; background: rgba(99,102,241,0.15); border-radius: 16px; border: 1px solid rgba(99,102,241,0.3);">
      <p style="margin: 0; color: #A5B4FC; font-size: 14px; font-weight: 600;">🏢 Debes apersonarte al LASIN para regularizar tu inscripción.</p>
    </div>
  `;

  await t.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: preinscripcion.correo,
    subject: `⚠️ Revisión de comprobante - ${c.nombre}`,
    html: emailTemplate('Comprobante Rechazado', '⚠️ Revisión', 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(220,38,38,0.2) 100%)', contenido),
  });
};