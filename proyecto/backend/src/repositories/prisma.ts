import { PrismaClient } from '@prisma/client';

// Única conexión a la base de datos (PostgreSQL) compartida por los repositorios.
export const prisma = new PrismaClient();
