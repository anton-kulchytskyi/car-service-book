import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { maintenanceSchedules, serviceRecords } from '@/lib/db/schema'

/**
 * Re-syncs lastDoneKm/lastDoneDate for all maintenance schedules of a car
 * from the service records. Call this after any record is created, updated or deleted.
 */
export async function syncMaintenanceSchedules(carId: string) {
  const [schedules, records] = await Promise.all([
    db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.carId, carId)),
    db.select().from(serviceRecords).where(eq(serviceRecords.carId, carId)).orderBy(desc(serviceRecords.date)),
  ])

  if (schedules.length === 0) return

  await Promise.all(
    schedules.map((schedule) => {
      const match = records.find(
        (r) => r.type.toLowerCase() === schedule.serviceName.toLowerCase()
      )
      return db
        .update(maintenanceSchedules)
        .set({
          lastDoneKm: match?.mileage ?? null,
          lastDoneDate: match ? new Date(match.date) : null,
        })
        .where(eq(maintenanceSchedules.id, schedule.id))
    })
  )
}
