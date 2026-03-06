import { z } from 'zod'

export const createCarSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .coerce.number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year is too far in the future'),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  photoUrl: z.string().url().optional().nullable(),
  photoPublicId: z.string().optional().nullable(),
})

export const updateCarSchema = createCarSchema.partial()

export const createRecordSchema = z.object({
  carId: z.string().uuid(),
  date: z.string().min(1, 'Date is required'),
  mileage: z.coerce.number().int().min(0, 'Mileage must be positive'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  cost: z.string().optional(),
})

export const updateRecordSchema = createRecordSchema.omit({ carId: true }).partial()

const scheduleBaseSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required'),
  intervalKm: z.coerce.number().int().min(1).optional().nullable(),
  intervalMonths: z.coerce.number().int().min(1).optional().nullable(),
  notes: z.string().optional().nullable(),
})

const intervalRefine = (d: { intervalKm?: number | null; intervalMonths?: number | null }) =>
  !!(d.intervalKm || d.intervalMonths)

export const createScheduleSchema = z.object({ carId: z.string().uuid() })
  .merge(scheduleBaseSchema)
  .refine(intervalRefine, { message: 'At least one interval (km or months) is required' })

export const updateScheduleSchema = scheduleBaseSchema
  .partial()
  .refine(intervalRefine, { message: 'At least one interval (km or months) is required' })

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>

export type CreateCarInput = z.infer<typeof createCarSchema>
export type UpdateCarInput = z.infer<typeof updateCarSchema>
export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
