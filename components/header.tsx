import { Link } from '@/i18n/navigation'
import { CarIcon, UserIcon } from 'lucide-react'
import LogoutButton from './logout-button'
import ThemeToggle from './theme-toggle'

type Props = { name: string }

export default function Header({ name }: Props) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CarIcon className="w-5 h-5" />
          Service Book
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <UserIcon className="w-3.5 h-3.5" />
            {name}
          </Link>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
