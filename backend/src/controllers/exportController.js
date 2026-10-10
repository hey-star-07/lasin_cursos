import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { generarPDFLista } from '../services/pdfService.js';
import { generarExcelLista } from '../services/excelService.js';

// GET /api/export/:cursoId/pdf
export const exportarPDF = async (req, res, next) => {
  try {
    const { cursoId } = req.params;

    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(cursoId) },
      include: {
        preinscripciones: {
          where: { estado: 'aceptado' },
          orderBy: [
            { apellidoPaterno: 'asc' },
            { apellidoMaterno: 'asc' },
            { nombres: 'asc' },
          ],
        },
      },
    });

    if (!curso) {
      throw new AppError('Curso no encontrado', 404);
    }

    if (curso.preinscripciones.length === 0) {
      throw new AppError('No hay estudiantes aceptados en este curso', 400);
    }

    const pdfBuffer = await generarPDFLista(curso);

    const nombreArchivo = `lista_${curso.nombre.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nombreArchivo}"`
    );
    res.setHeader('Cache-Control', 'no-cache');

    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// GET /api/export/:cursoId/excel
export const exportarExcel = async (req, res, next) => {
  try {
    const { cursoId } = req.params;

    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(cursoId) },
      include: {
        preinscripciones: {
          where: { estado: 'aceptado' },
          orderBy: [
            { apellidoPaterno: 'asc' },
            { apellidoMaterno: 'asc' },
            { nombres: 'asc' },
          ],
        },
      },
    });

    if (!curso) {
      throw new AppError('Curso no encontrado', 404);
    }

    if (curso.preinscripciones.length === 0) {
      throw new AppError('No hay estudiantes aceptados en este curso', 400);
    }

    const excelBuffer = await generarExcelLista(curso);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="planilla_${curso.nombre.replace(/\s+/g, '_')}.xlsx"`
    );
    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};