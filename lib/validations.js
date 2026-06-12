// lib/validations.js
import { z } from 'zod';

export const animalSchema = z.object({
  name: z.string().trim().min(1, 'El código o nombre es obligatorio'),

  species: z.string().trim().min(1, 'La especie es obligatoria'),

  breed: z.string().trim().min(1, 'La raza es obligatoria'),

  birthDate: z.coerce.date({
    message: 'La fecha de nacimiento no es válida',
  }),

  gender: z.enum(['HEMBRA', 'MACHO'], {
    message: 'El sexo debe ser HEMBRA o MACHO',
  }),

  status: z.enum(['HEALTHY', 'SICK', 'SOLD', 'DECEASED'], {
    message: 'El estado no es válido',
  }),

  purpose: z.string().trim().optional().default('Engorde'),

  litterCode: z.string().trim().optional().nullable(),

  currentWeight: z.coerce
    .number()
    .positive('El peso debe ser mayor a 0'),
});

export const healthLogSchema = z.object({
  animal_id: z.coerce
    .number()
    .int('ID de animal inválido')
    .positive('ID de animal inválido'),

  diagnostic: z.string()
    .trim()
    .min(3, 'El diagnóstico es muy corto'),

  treatment: z.string()
    .trim()
    .min(3, 'Especifique el tratamiento'),

  date: z.coerce.date({
    message: 'La fecha no es válida',
  }),
});

export const feedingLogSchema = z.object({
  animal_id: z.coerce
    .number()
    .int('ID de animal inválido')
    .positive('ID de animal inválido'),

  food_type: z.string()
    .trim()
    .min(1, 'El tipo de alimento es obligatorio'),

  quantity: z.coerce
    .number()
    .positive('La cantidad debe ser mayor a 0'),

  date: z.coerce.date({
    message: 'La fecha no es válida',
  }),
});

export const growthLogSchema = z.object({
  animal_id: z.coerce
    .number()
    .int('ID de animal inválido')
    .positive('ID de animal inválido'),

  weight: z.coerce
    .number()
    .positive('El peso debe ser mayor a 0'),

  date: z.coerce.date({
    message: 'La fecha no es válida',
  }),
});