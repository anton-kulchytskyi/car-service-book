import Link from 'next/link'
import { CarIcon } from 'lucide-react'
import LogoutButton from './logout-button'

type Props = { name: string }

export default function Header({ name }: Props) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <CarIcon className="w-5 h-5" />
          Service Book
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{name}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
