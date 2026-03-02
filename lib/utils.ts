import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLicensePlate(plate: string): string {
  const clean = plate.toUpperCase().replace(/\s+/g, '')
  if (!clean) return ''
  // Insert spaces on letter↔digit transitions: "AA1234BB" → "AA 1234 BB"
  return clean.split(/(?<=\p{L})(?=\d)|(?<=\d)(?=\p{L})/u).join(' ')
}
