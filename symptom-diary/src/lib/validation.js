import { z } from 'zod';

/**
 * SymptomSchema — valida una entrada de síntoma antes del INSERT en Supabase.
 *
 * Campos:
 * - name:      nombre del síntoma (obligatorio, 1-100 caracteres)
 * - intensity: escala 1-10, entero
 * - date:      ISO 8601 con offset, o cualquier string no vacío (compatibilidad)
 * - bodyArea:  área corporal opcional
 * - triggers:  lista de desencadenantes (máx. 10, cada uno máx. 50 chars)
 * - notes:     notas libres opcionales (máx. 1000 chars)
 */
export const SymptomSchema = z.object({
  name: z.string().min(1).max(100),
  intensity: z.number().int().min(1).max(10),
  date: z.string().datetime({ offset: true }).or(z.string().min(1)),
  bodyArea: z.string().max(50).optional().nullable(),
  triggers: z.array(z.string().max(50)).max(10).default([]),
  notes: z.string().max(1000).optional().nullable().default(''),
});

/**
 * ApiKeySchema — valida el formato básico de una API key de Anthropic.
 *
 * Requisitos:
 * - Longitud mínima de 20 caracteres
 * - Debe comenzar con 'sk-ant-'
 */
export const ApiKeySchema = z.string()
  .min(20)
  .refine(k => k.startsWith('sk-ant-'), {
    message: 'La API key debe empezar por sk-ant-',
  });
