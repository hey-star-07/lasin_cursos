import { z } from 'zod';
import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

const cursoSchema = z.object({
  nombre: z.string().min(3, 'Nombre muy corto'),
  nivel: z.string().optional().nullable(),
  modalidad: z.string().optional().nullable(),
  fechaInicio: z.string().optional().nullable(),
  fechaFin: z.string().optional().nullable(),
  horaInicio: z.string().optional().nullable(),
  horaFin: z.string().optional().nullable(),
  duracion: z.string().optional().nullable(),
  costo: z.coerce.number().min(0).default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().nullable(),
  descripcion: z.string().optional().nullable(),
  totalHoras: z.coerce.number().int().min(0).optional().nullable(),
  instructor: z.string().optional().nullable(),
  contenido: z.string().optional().nullable(),
  requisitosPrevios: z.string().optional().nullable(),
  enlaceWhatsapp: z.string().url().optional().nullable().or(z.literal('')),
});

/**
 * Convierte un string YYYY-MM-DD a Date sin shift de timezone.
 * Guarda como UTC medianoche del día indicado.
 */
const parseFechaLocal = (fechaStr) => {
  if (!fechaStr) return null;

  // Si ya es un objeto Date, extraer solo la parte YYYY-MM-DD
  if (fechaStr instanceof Date) {
    fechaStr = fechaStr.toISOString().split('T')[0];
  }

  // Formato esperado: YYYY-MM-DD
  const match = String(fechaStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
};

const parseFechas = (data) => ({
  ...data,
  fechaInicio: data.fechaInicio ? parseFechaLocal(data.fechaInicio) : null,
  fechaFin: data.fechaFin ? parseFechaLocal(data.fechaFin) : null,
});

// GET /api/cursos
export const listarCursos = async (req, res, next) => {
  try {
    const { publicado } = req.query;

    const where = {};
    if (publicado !== undefined) {
      where.publicado = publicado === 'true';
    }

    const cursos = await prisma.curso.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            preinscripciones: { where: { estado: 'aceptado' } },
          },
        },
      },
    });

    res.json({ status: 'ok', total: cursos.length, cursos });
  } catch (error) {
    next(error);
  }
};

// GET /api/cursos/:id
export const obtenerCurso = async (req, res, next) => {
  try {
    const { id } = req.params;

    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(id) },
      include: {
        preinscripciones: {
          where: { estado: 'aceptado' },
          select: { id: true, nombres: true, apellidoPaterno: true },
        },
      },
    });

    if (!curso) {
      throw new AppError('Curso no encontrado', 404);
    }

    res.json({ status: 'ok', curso });
  } catch (error) {
    next(error);
  }
};

// POST /api/cursos
export const crearCurso = async (req, res, next) => {
  try {
    const data = cursoSchema.parse(req.body);
    const dataParsed = parseFechas(data);

    // Subir afiche a Cloudinary si existe
    let aficheUrl = null;
    let afichePublicId = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'afiches');
      aficheUrl = result.secure_url;
      afichePublicId = result.public_id;
    }

    const curso = await prisma.curso.create({
      data: {
        ...dataParsed,
        aficheUrl,
        afichePublicId,
      },
    });

    res.status(201).json({ status: 'ok', curso });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

// PUT /api/cursos/:id
export const actualizarCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cursoId = parseInt(id);

    const existente = await prisma.curso.findUnique({ where: { id: cursoId } });
    if (!existente) {
      throw new AppError('Curso no encontrado', 404);
    }

    const data = cursoSchema.partial().parse(req.body);
    const dataParsed = parseFechas(data);

    // Si hay nuevo afiche, eliminar el anterior de Cloudinary
    let aficheData = {};
    if (req.file) {
      if (existente.afichePublicId) {
        await deleteFromCloudinary(existente.afichePublicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'afiches');
      aficheData = {
        aficheUrl: result.secure_url,
        afichePublicId: result.public_id,
      };
    }

    const curso = await prisma.curso.update({
      where: { id: cursoId },
      data: { ...dataParsed, ...aficheData },
    });

    res.json({ status: 'ok', curso });
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

// DELETE /api/cursos/:id
export const eliminarCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cursoId = parseInt(id);

    const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
    if (!curso) {
      throw new AppError('Curso no encontrado', 404);
    }

    // Eliminar afiche de Cloudinary
    if (curso.afichePublicId) {
      await deleteFromCloudinary(curso.afichePublicId);
    }

    await prisma.curso.delete({ where: { id: cursoId } });

    res.json({ status: 'ok', message: 'Curso eliminado' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/cursos/:id/whatsapp
export const actualizarWhatsapp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enlaceWhatsapp } = req.body;

    if (!enlaceWhatsapp) {
      throw new AppError('Enlace de WhatsApp requerido', 400);
    }

    const curso = await prisma.curso.update({
      where: { id: parseInt(id) },
      data: { enlaceWhatsapp },
    });

    res.json({ status: 'ok', curso });
  } catch (error) {
    next(error);
  }
};

