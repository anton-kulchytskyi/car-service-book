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

export type CreateCarInput = z.infer<typeof createCarSchema>
export type UpdateCarInput = z.infer<typeof updateCarSchema>
export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
