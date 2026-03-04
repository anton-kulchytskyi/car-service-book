export const MAINTENANCE_DEFAULTS: {
  name: string
  intervalKm?: number
  intervalMonths?: number
}[] = [
  { name: 'Oil Change',             intervalKm: 10000, intervalMonths: 6  },
  { name: 'Air Filter',             intervalKm: 20000, intervalMonths: 12 },
  { name: 'Cabin Filter',           intervalKm: 15000, intervalMonths: 12 },
  { name: 'Spark Plugs',            intervalKm: 30000                      },
  { name: 'Timing Belt',            intervalKm: 80000                      },
  { name: 'Brake Pads',             intervalKm: 30000                      },
  { name: 'Brake Fluid',                               intervalMonths: 24 },
  { name: 'Coolant Flush',          intervalKm: 60000, intervalMonths: 24 },
  { name: 'Transmission Fluid',     intervalKm: 60000                      },
  { name: 'Power Steering Fluid',   intervalKm: 50000                      },
  { name: 'Tire Rotation',          intervalKm: 10000                      },
  { name: 'Technical Inspection',                      intervalMonths: 24 },
  { name: 'Insurance',                                 intervalMonths: 12 },
]

export const SERVICE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Tire Replacement',
  'Brake Service',
  'Air Filter',
  'Cabin Filter',
  'Battery Replacement',
  'Technical Inspection',
  'Coolant Flush',
  'Transmission Service',
  'Spark Plugs',
  'Timing Belt',
  'Other',
] as const
