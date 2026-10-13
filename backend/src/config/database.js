// src/config/database.js
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env.js';

const { Pool } = pg;
const globalForPrisma = globalThis;

function createPrismaClient() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 10000,       // cerrar conexiones ociosas antes de que Neon las corte
    connectionTimeoutMillis: 30000, // dar tiempo a que Neon despierte
    keepAlive: true,
  });

  // Sin este handler, un corte de conexión ociosa (Neon suspendido)
  // puede tumbar todo el proceso de Node.
  pool.on('error', (err) => {
    console.error('[DB] Error en conexión ociosa (ignorado):', err.message);
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;