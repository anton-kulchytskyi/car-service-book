import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import CarForm from '@/components/forms/car-form'

export default function NewCarPage() {
  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        My Cars
      </Link>
      <h1 className="text-2xl font-bold mb-6">Add Car</h1>
      <CarForm />
    </div>
  )
}
