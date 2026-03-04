import { pgTable, text, integer, numeric, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const cars = pgTable('cars', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  vin: text('vin'),
  licensePlate: text('license_plate'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const serviceRecords = pgTable('service_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  mileage: integer('mileage').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const maintenanceSchedules = pgTable('maintenance_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  serviceName: text('service_name').notNull(),
  intervalKm: integer('interval_km'),
  intervalMonths: integer('interval_months'),
  lastDoneKm: integer('last_done_km'),
  lastDoneDate: timestamp('last_done_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
}))

export const carsRelations = relations(cars, ({ one, many }) => ({
  user: one(users, { fields: [cars.userId], references: [users.id] }),
  serviceRecords: many(serviceRecords),
  maintenanceSchedules: many(maintenanceSchedules),
}))

export const serviceRecordsRelations = relations(serviceRecords, ({ one }) => ({
  car: one(cars, { fields: [serviceRecords.carId], references: [cars.id] }),
}))

export const maintenanceSchedulesRelations = relations(maintenanceSchedules, ({ one }) => ({
  car: one(cars, { fields: [maintenanceSchedules.carId], references: [cars.id] }),
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Car = typeof cars.$inferSelect
export type NewCar = typeof cars.$inferInsert
export type ServiceRecord = typeof serviceRecords.$inferSelect
export type NewServiceRecord = typeof serviceRecords.$inferInsert
export type MaintenanceSchedule = typeof maintenanceSchedules.$inferSelect
export type NewMaintenanceSchedule = typeof maintenanceSchedules.$inferInsert
