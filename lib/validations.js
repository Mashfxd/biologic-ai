// lib/validations.js
import { z } from 'zod';

// Esquema para la creación de un nuevo Animal
export const animalSchema = z.object({
  code: z.string().min(1, "El código es obligatorio"),
  // Zod se asegura de que coincida exactamente con tu Enum de Prisma
  sex: z.enum(['MACHO', 'HEMBRA'], { 
    errorMap: () => ({ message: "El sexo debe ser MACHO o HEMBRA" }) 
  }),
  status: z.enum(['VIVO', 'VENDIDO', 'FALLECIDO']).optional().default('VIVO'),
});

// Esquema para registrar Salud (Ideal para el módulo que vimos antes)
export const healthLogSchema = z.object({
  animal_id: z.number().int().positive("ID de animal inválido"),
  diagnostic: z.string().min(3, "El diagnóstico es muy corto"),
  treatment: z.string().min(3, "Especifique el tratamiento"),
  // Transforma el string de la fecha en un objeto Date válido
  date: z.string().transform((str) => new Date(str)), 
});