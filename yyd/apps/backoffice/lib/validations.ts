import { z } from 'zod';

export const PayrollCreateSchema = z.object({
  employeeId: z.string().optional(),
  guideId: z.string().optional(),
  vendorName: z.string().optional(),
  payrollType: z.enum(['employee', 'guide', 'vendor']),
  period: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  grossAmount: z.coerce.number().positive(),
  deductions: z.coerce.number().nonnegative().default(0),
  currency: z.string().default('BRL'),
  status: z.enum(['pending', 'approved', 'paid', 'cancelled']).default('pending'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => data.employeeId || data.guideId || data.vendorName,
  { message: 'Must provide employeeId, guideId, or vendorName' }
).refine(
  (data) => data.periodStart <= data.periodEnd,
  { message: 'periodStart must be before or equal to periodEnd' }
);

export const PayrollUpdateSchema = z.object({
  period: z.string().optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  grossAmount: z.coerce.number().positive().optional(),
  deductions: z.coerce.number().nonnegative().optional(),
  status: z.enum(['pending', 'approved', 'paid', 'cancelled']).optional(),
  paidAt: z.coerce.date().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const CustomerUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  leadStatus: z.enum(['lead', 'contact', 'quote', 'booking', 'confirmed', 'cancelled']).optional(),
  leadScore: z.coerce.number().min(0).max(100).optional(),
  assignedTo: z.string().optional(),
});

export const SegmentCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  filters: z.record(z.any()),
  autoUpdate: z.boolean().default(true),
  active: z.boolean().default(true),
});

export const SegmentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  filters: z.record(z.any()).optional(),
  autoUpdate: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const AutomationCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.enum(['booking_confirmed', 'tour_completed', 'customer_birthday', 'inactive_6months', 'booking_reminder']),
  conditions: z.record(z.any()).optional(),
  actions: z.array(z.record(z.any())),
  active: z.boolean().default(true),
});

export const AutomationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  trigger: z.enum(['booking_confirmed', 'tour_completed', 'customer_birthday', 'inactive_6months', 'booking_reminder']).optional(),
  conditions: z.record(z.any()).optional(),
  actions: z.array(z.record(z.any())).optional(),
  active: z.boolean().optional(),
});
