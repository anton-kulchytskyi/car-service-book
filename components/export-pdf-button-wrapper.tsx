'use client'

import dynamic from 'next/dynamic'
import type { Car, ServiceRecord, CarOwnershipHistory } from '@/lib/db/schema'

const ExportPdfButton = dynamic(() => import('@/components/export-pdf-button'), { ssr: false })

type Props = {
  car: Car
  records: ServiceRecord[]
  ownershipHistory: CarOwnershipHistory[]
  totalCost: number
  currentKm: number | null
}

export default function ExportPdfButtonWrapper(props: Props) {
  return <ExportPdfButton {...props} />
}
