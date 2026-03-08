export const SERVICE_TYPES = [
  'oil_change',
  'air_filter',
  'cabin_filter',
  'spark_plugs',
  'timing_belt',
  'brake_pads',
  'brake_fluid',
  'coolant_flush',
  'transmission_fluid',
  'power_steering_fluid',
  'tire_rotation',
  'tire_replacement',
  'battery_replacement',
  'technical_inspection',
  'insurance',
  'other',
] as const

export type ServiceType = typeof SERVICE_TYPES[number]

export const MAINTENANCE_DEFAULTS: {
  name: ServiceType
  intervalKm?: number
  intervalMonths?: number
}[] = [
  { name: 'oil_change',            intervalKm: 10000, intervalMonths: 6  },
  { name: 'air_filter',            intervalKm: 20000, intervalMonths: 12 },
  { name: 'cabin_filter',          intervalKm: 15000, intervalMonths: 12 },
  { name: 'spark_plugs',           intervalKm: 30000                      },
  { name: 'timing_belt',           intervalKm: 80000                      },
  { name: 'brake_pads',            intervalKm: 30000                      },
  { name: 'brake_fluid',                               intervalMonths: 24 },
  { name: 'coolant_flush',         intervalKm: 60000, intervalMonths: 24 },
  { name: 'transmission_fluid',    intervalKm: 60000                      },
  { name: 'power_steering_fluid',  intervalKm: 50000                      },
  { name: 'tire_rotation',         intervalKm: 10000                      },
  { name: 'technical_inspection',                      intervalMonths: 24 },
  { name: 'insurance',                                 intervalMonths: 12 },
]
