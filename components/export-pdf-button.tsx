'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { DownloadIcon } from 'lucide-react'
import CarServicePdf from '@/components/pdf/car-service-pdf'
import type { Car, ServiceRecord, CarOwnershipHistory } from '@/lib/db/schema'

type Props = {
  car: Car
  records: ServiceRecord[]
  ownershipHistory: CarOwnershipHistory[]
  totalCost: number
  currentKm: number | null
}

export default function ExportPdfButton({ car, records, ownershipHistory, totalCost, currentKm }: Props) {
  const [isPending, setIsPending] = useState(false)

  async function handleExport() {
    setIsPending(true)
    try {
      const blob = await pdf(
        <CarServicePdf
          car={car}
          records={records}
          ownershipHistory={ownershipHistory}
          totalCost={totalCost}
          currentKm={currentKm}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${car.make}-${car.model}-${car.year}-service.pdf`.toLowerCase().replace(/\s+/g, '-')
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isPending} className="cursor-pointer">
      <DownloadIcon className="w-4 h-4 mr-1.5" />
      {isPending ? 'Generating…' : 'Export PDF'}
    </Button>
  )
}
