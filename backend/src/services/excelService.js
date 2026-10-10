import ExcelJS from 'exceljs';

const formatearFecha = (fecha) => {
  if (!fecha) return 'Por definir';
  const match = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return new Date(fecha).toLocaleDateString('es-BO');
};

export const generarExcelLista = async (curso) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema Cursos LASIN';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Lista de Inscritos', {
    pageSetup: { paperSize: 9, orientation: 'portrait' },
  });

  sheet.columns = [
    { key: 'num', width: 6 },
    { key: 'paterno', width: 18 },
    { key: 'materno', width: 18 },
    { key: 'nombres', width: 25 },
    { key: 'ci', width: 15 },
    { key: 'telefono', width: 15 },
    { key: 'correo', width: 30 },
    { key: 'nota', width: 10 },
    { key: 'firma', width: 20 },
  ];

  const headerStyle = {
    font: { bold: true, size: 12, color: { argb: 'FF000000' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  };

  // Encabezado institucional
  sheet.mergeCells('A1:I1');
  sheet.getCell('A1').value = 'UNIVERSIDAD MAYOR DE SAN ANDRÉS';
  sheet.getCell('A1').style = { ...headerStyle, font: { bold: true, size: 14 } };

  sheet.mergeCells('A2:I2');
  sheet.getCell('A2').value = 'FACULTAD DE CIENCIAS PURAS Y NATURALES';
  sheet.getCell('A2').style = headerStyle;

  sheet.mergeCells('A3:I3');
  sheet.getCell('A3').value = 'CARRERA DE INFORMÁTICA - LABORATORIO SUPERIOR DE INFORMÁTICA';
  sheet.getCell('A3').style = headerStyle;

  sheet.mergeCells('A5:I5');
  sheet.getCell('A5').value = curso.nombre.toUpperCase();
  sheet.getCell('A5').style = { ...headerStyle, font: { bold: true, size: 13 } };

  // Info del curso (2 filas: datos básicos + fechas)
  const infoRow = (row, key1, val1, key2, val2) => {
    sheet.getCell(`A${row}`).value = key1;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.mergeCells(`B${row}:D${row}`);
    sheet.getCell(`B${row}`).value = val1;

    if (key2) {
      sheet.getCell(`F${row}`).value = key2;
      sheet.getCell(`F${row}`).font = { bold: true };
      sheet.mergeCells(`G${row}:I${row}`);
      sheet.getCell(`G${row}`).value = val2;
    }
  };

  infoRow(7, 'Instructor:', curso.instructor || 'Por definir', 'Modalidad:', curso.modalidad || 'N/A');
  infoRow(8, 'Inicio:', formatearFecha(curso.fechaInicio), 'Fin:', formatearFecha(curso.fechaFin));
  infoRow(
    9,
    'Horario:',
    curso.horaInicio && curso.horaFin ? `${curso.horaInicio} – ${curso.horaFin}` : 'N/A',
    'Duración:',
    curso.duracion || 'N/A'
  );

  // Fila de encabezados de tabla (fila 11)
  const headerRow = sheet.getRow(11);
  headerRow.values = ['N°', 'PATERNO', 'MATERNO', 'NOMBRES', 'C.I.', 'TELÉFONO', 'CORREO', 'NOTA', 'FIRMA'];
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Datos de estudiantes
  curso.preinscripciones.forEach((e, i) => {
    const row = sheet.addRow([
      i + 1,
      (e.apellidoPaterno || '').toUpperCase(),
      (e.apellidoMaterno || '').toUpperCase(),
      (e.nombres || '').toUpperCase(),
      e.ci || '',
      e.telefono || '',
      (e.correo || '').toLowerCase(),
      '',
      '',
    ]);
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    row.getCell(5).numFmt = '@';
    row.getCell(6).numFmt = '@';
  });

  // Total
  sheet.addRow([]);
  const totalRow = sheet.addRow([`Total estudiantes: ${curso.preinscripciones.length}`]);
  totalRow.getCell(1).font = { bold: true };

  // Bloque de firma del instructor (3 filas vacías + línea + nombre)
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);

  const firmaStartRow = sheet.lastRow.number + 1;

  // Línea superior para firma
  sheet.mergeCells(`C${firmaStartRow}:F${firmaStartRow}`);
  const lineaCell = sheet.getCell(`C${firmaStartRow}`);
  lineaCell.border = { top: { style: 'thin' } };
  lineaCell.alignment = { horizontal: 'center' };

  // Nombre del instructor
  sheet.mergeCells(`C${firmaStartRow + 1}:F${firmaStartRow + 1}`);
  const nombreCell = sheet.getCell(`C${firmaStartRow + 1}`);
  nombreCell.value = (curso.instructor || 'Instructor').toUpperCase();
  nombreCell.font = { bold: true, size: 11 };
  nombreCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Cargo
  sheet.mergeCells(`C${firmaStartRow + 2}:F${firmaStartRow + 2}`);
  const cargoCell = sheet.getCell(`C${firmaStartRow + 2}`);
  cargoCell.value = 'Instructor del Curso';
  cargoCell.font = { size: 9, color: { argb: 'FF666666' } };
  cargoCell.alignment = { horizontal: 'center', vertical: 'middle' };

  return await workbook.xlsx.writeBuffer();
};