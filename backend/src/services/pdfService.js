import puppeteer from 'puppeteer';

const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatearFecha = (fecha) => {
  if (!fecha) return 'Por definir';
  return new Date(fecha).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const generarPDFLista = async (curso) => {
  const estudiantes = curso.preinscripciones;
  const total = estudiantes.length;

  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Por definir';
    const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
    return new Date(fecha).toLocaleDateString('es-BO');
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 20mm 15mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11pt; color: #000; background: #fff; }
  .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 15px; }
  .header h1 { font-size: 14pt; font-weight: bold; }
  .header h2 { font-size: 12pt; font-weight: bold; }
  .header h3, .header h4 { font-size: 11pt; font-weight: normal; }
  .curso-titulo { font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-top: 10px; }
  .doc-title { text-align: center; font-size: 12pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }
  .info-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; margin-bottom: 25px; }
  .info-table { width: 100%; border-collapse: collapse; }
  .info-table td { padding: 4px 8px; vertical-align: top; font-size: 9.5pt; }
  .info-label { font-weight: bold; color: #495057; width: 120px; }
  .tabla { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .tabla th { background: #f1f3f5; font-weight: bold; font-size: 9pt; text-align: left; padding: 10px 8px; border-top: 1px solid #dee2e6; border-bottom: 2px solid #adb5bd; text-transform: uppercase; }
  .tabla td { padding: 8px; font-size: 9pt; border-bottom: 1px solid #e9ecef; color: #333; }
  .tabla tr:nth-child(even) { background: #fcfcfc; }
  .col-num { width: 30px; text-align: center; }
  .col-ci { width: 85px; text-align: center; }
  .col-tel { width: 85px; text-align: center; }
  .col-nota { width: 45px; text-align: center; }
  .col-firma { width: 110px; }
  .resumen { margin-top: 10px; font-size: 10pt; font-weight: bold; }
  .instructor-firma { margin-top: 60px; text-align: center; page-break-inside: avoid; }
  .instructor-firma .linea { border-top: 1px solid #000; width: 300px; margin: 0 auto 5px auto; }
  .instructor-firma .nombre { font-weight: bold; text-transform: uppercase; font-size: 11pt; }
  .instructor-firma .cargo { font-size: 9pt; color: #666; }
</style>
</head>
<body>
  <div class="header">
    <h1>UNIVERSIDAD MAYOR DE SAN ANDRÉS</h1>
    <h2>FACULTAD DE CIENCIAS PURAS Y NATURALES</h2>
    <h3>CARRERA DE INFORMÁTICA</h3>
    <h4>LABORATORIO SUPERIOR DE INFORMÁTICA</h4>
    <div class="curso-titulo">${escapeHtml(curso.nombre)}</div>
  </div>

  <div class="doc-title">Nómina de Inscritos</div>

  <div class="info-box">
    <table class="info-table">
      <tr>
        <td class="info-label">Programa:</td>
        <td><strong>${escapeHtml(curso.nombre)}</strong></td>
        <td class="info-label">Instructor:</td>
        <td>${escapeHtml(curso.instructor || 'No asignado')}</td>
      </tr>
      <tr>
        <td class="info-label">Inicio:</td>
        <td>${formatearFecha(curso.fechaInicio)}</td>
        <td class="info-label">Fin:</td>
        <td>${formatearFecha(curso.fechaFin)}</td>
      </tr>
      <tr>
        <td class="info-label">Modalidad:</td>
        <td>${escapeHtml(curso.modalidad || 'N/A')}</td>
        <td class="info-label">Horario:</td>
        <td>${curso.horaInicio && curso.horaFin ? `${curso.horaInicio} – ${curso.horaFin}` : 'N/A'}</td>
      </tr>
      <tr>
        <td class="info-label">Duración:</td>
        <td colspan="3">${escapeHtml(curso.duracion || 'N/A')}</td>
      </tr>
    </table>
  </div>

  <table class="tabla">
    <thead>
      <tr>
        <th class="col-num">N°</th>
        <th>APELLIDOS Y NOMBRES</th>
        <th class="col-ci">C.I.</th>
        <th class="col-tel">TELÉFONO</th>
        <th class="col-nota">NOTA</th>
        <th class="col-firma">FIRMA</th>
      </tr>
    </thead>
    <tbody>
      ${estudiantes.map((e, i) => `
        <tr>
          <td class="col-num">${i + 1}</td>
          <td>${escapeHtml(e.apellidoPaterno || '')} ${escapeHtml(e.apellidoMaterno || '')} ${escapeHtml(e.nombres || '')}</td>
          <td class="col-ci">${escapeHtml(e.ci || '')}</td>
          <td class="col-tel">${escapeHtml(e.telefono || '')}</td>
          <td class="col-nota"></td>
          <td class="col-firma"></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="resumen">TOTAL ESTUDIANTES INSCRITOS: ${total}</div>

  <div class="instructor-firma">
    <div class="linea"></div>
    <div class="nombre">${escapeHtml(curso.instructor || 'Instructor')}</div>
    <div class="cargo">Instructor del Curso</div>
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};