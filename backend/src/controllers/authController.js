import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Esquemas de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const signToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const sendTokenResponse = (usuario, statusCode, res) => {
  const token = signToken(usuario.id);

  res.status(statusCode).json({
    status: 'ok',
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  });
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = registerSchema.parse(req.body);

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      throw new AppError('El email ya está registrado', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: { nombre, email, passwordHash, rol: 'admin' },
      select: { id: true, nombre: true, email: true, rol: true },
    });

    sendTokenResponse(usuario, 201, res);
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    console.log(`[AUTH] 🔑 Intento de login: ${email}`);

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      console.warn(`[AUTH] ❌ Usuario no encontrado o inactivo: ${email}`);
      throw new AppError('Credenciales inválidas', 401);
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      console.warn(`[AUTH] ❌ Password incorrecta para: ${email}`);
      throw new AppError('Credenciales inválidas', 401);
    }

    console.log(`[AUTH] ✅ Login exitoso: ${email}`);
    sendTokenResponse(usuario, 200, res);
  } catch (error) {
    if (error.name === 'ZodError') {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  res.json({
    status: 'ok',
    usuario: req.usuario,
  });
};