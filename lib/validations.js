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

export const productionSchema = z.object({
  poza: z.string().trim().min(1, 'La poza es obligatoria'),

  motherId: z.coerce
    .number()
    .int('El ID de la madre debe ser un número entero')
    .positive('La madre es obligatoria'),

  fatherId: z
    .union([
      z.coerce.number().int().positive(),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional(),

  matingDate: z
    .union([
      z.coerce.date(),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .optional(),

  birthDate: z.coerce.date({
    message: 'La fecha de parto no es válida',
  }),

  bornAlive: z.coerce
    .number()
    .int('Los nacidos vivos deben ser un número entero')
    .min(0, 'Los nacidos vivos no pueden ser negativos'),

  bornDead: z.coerce
    .number()
    .int('Los nacidos muertos deben ser un número entero')
    .min(0, 'Los nacidos muertos no pueden ser negativos')
    .default(0),

  avgBirthWeight: z.coerce
    .number()
    .positive('El peso promedio debe ser mayor a 0'),

  observations: z.string().trim().optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const createUserSchema = z.object({
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['ADMIN', 'OPERATOR']).default('OPERATOR'),
});

export const updateUserSchema = z.object({
  id: z.coerce.number().int().positive('ID inválido'),
  username: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().trim().email('Email inválido'),
  role: z.enum(['ADMIN', 'OPERATOR']),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
});