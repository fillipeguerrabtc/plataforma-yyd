import { z } from 'zod';

export const tourSchema = z.object({
  titlePt: z.string().min(5, 'Título em português deve ter pelo menos 5 caracteres').max(255),
  titleEn: z.string().min(5, 'English title must be at least 5 characters').max(255),
  titleEs: z.string().min(5, 'Título en español debe tener al menos 5 caracteres').max(255),
  
  descriptionPt: z.string().min(50, 'Descrição deve ter pelo menos 50 caracteres'),
  descriptionEn: z.string().min(50, 'Description must be at least 50 characters'),
  descriptionEs: z.string().min(50, 'Descripción debe tener al menos 50 caracteres'),
  
  categoryPt: z.string().min(3, 'Categoria inválida').max(100),
  categoryEn: z.string().min(3, 'Invalid category').max(100),
  categoryEs: z.string().min(3, 'Categoría inválida').max(100),
  
  durationHours: z.number().min(0.5, 'Duração mínima: 30 minutos').max(24, 'Duração máxima: 24 horas'),
  maxGroupSize: z.number().int().min(1, 'Grupo mínimo: 1 pessoa').max(36, 'Grupo máximo: 36 pessoas'),
  
  slug: z.string()
    .min(3, 'Slug muito curto')
    .max(100, 'Slug muito longo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  
  imageUrl: z.string().url('URL de imagem inválida').optional().nullable(),
  
  bestChoice: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  
  highlightsPt: z.array(z.string()).optional().nullable(),
  highlightsEn: z.array(z.string()).optional().nullable(),
  highlightsEs: z.array(z.string()).optional().nullable(),
  
  includedPt: z.array(z.string()).optional().nullable(),
  includedEn: z.array(z.string()).optional().nullable(),
  includedEs: z.array(z.string()).optional().nullable(),
  
  notIncludedPt: z.array(z.string()).optional().nullable(),
  notIncludedEn: z.array(z.string()).optional().nullable(),
  notIncludedEs: z.array(z.string()).optional().nullable(),
});

export type TourFormData = z.infer<typeof tourSchema>;

export const priceSchema = z.object({
  productId: z.string().cuid('ID de produto inválido'),
  season: z.string().min(1, 'Temporada obrigatória').max(50),
  tier: z.string().min(1, 'Tier obrigatório').max(50),
  startMonth: z.coerce.number().int().min(1, 'Mês inicial: 1-12').max(12),
  endMonth: z.coerce.number().int().min(1, 'Mês final: 1-12').max(12),
  minPeople: z.coerce.number().int().min(1, 'Mínimo: 1').max(36),
  maxPeople: z.coerce.number().int().min(1, 'Máximo: 1').max(36).optional().nullable(),
  priceEur: z.coerce.number().min(0, 'Preço deve ser positivo'),
  pricePerPerson: z.boolean().optional().default(false),
}).refine((data) => data.minPeople <= (data.maxPeople || 999), {
  message: 'Mínimo deve ser menor ou igual ao máximo',
  path: ['maxPeople'],
});

export type PriceFormData = z.infer<typeof priceSchema>;

export const activitySchema = z.object({
  productId: z.string().cuid('ID de produto inválido'),
  nameEn: z.string().min(3, 'English name required').max(255),
  namePt: z.string().min(3, 'Nome português obrigatório').max(255),
  nameEs: z.string().min(3, 'Nombre español requerido').max(255),
  descriptionEn: z.string().min(10, 'English description required').max(1000),
  descriptionPt: z.string().min(10, 'Descrição portuguesa obrigatória').max(1000),
  descriptionEs: z.string().min(10, 'Descripción española requerida').max(1000),
  imageUrl: z.string().url('URL inválida').optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

export const optionSchema = z.object({
  productId: z.string().cuid('ID de produto inválido'),
  nameEn: z.string().min(3, 'English name required').max(255),
  namePt: z.string().min(3, 'Nome português obrigatório').max(255),
  nameEs: z.string().min(3, 'Nombre español requerido').max(255),
  descriptionEn: z.string().min(10, 'English description required').max(1000),
  descriptionPt: z.string().min(10, 'Descrição portuguesa obrigatória').max(1000),
  descriptionEs: z.string().min(10, 'Descripción española requerida').max(1000),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
});

export type OptionFormData = z.infer<typeof optionSchema>;

export const bookingSchema = z.object({
  customerId: z.string().uuid('ID de cliente inválido'),
  productId: z.string().uuid('ID de produto inválido'),
  date: z.date(),
  numberOfPeople: z.number().int().min(1).max(36),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
  pickupLocation: z.string().min(5, 'Local de embarque muito curto').max(500),
  specialRequests: z.string().max(1000, 'Máximo 1000 caracteres').optional().nullable(),
  priceEur: z.number().min(0, 'Preço deve ser positivo'),
  season: z.enum(['low', 'high', 'peak', 'special']).optional().default('high'),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }).optional().default('pending'),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const customerSchema = z.object({
  name: z.string().min(3, 'Nome muito curto').max(255),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().min(9, 'Telefone inválido').max(20),
  locale: z.enum(['en', 'pt', 'es']).optional().default('en'),
  country: z.string().length(2, 'Código de país deve ter 2 letras').optional().nullable(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export const guideSchema = z.object({
  name: z.string().min(3, 'Nome muito curto').max(255),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().min(9, 'Telefone inválido').max(20),
  licenseNumber: z.string().min(5, 'Número de licença inválido').max(50),
  languages: z.array(z.string().length(2, 'Código de idioma deve ter 2 letras')).min(1, 'Pelo menos 1 idioma'),
  certifications: z.array(z.string()).optional().nullable(),
  active: z.boolean().optional().default(true),
  availability: z.record(z.string(), z.boolean()).optional().nullable(),
});

export type GuideFormData = z.infer<typeof guideSchema>;
