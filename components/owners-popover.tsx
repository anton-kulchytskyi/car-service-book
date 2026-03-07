'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UsersIcon } from 'lucide-react'

type OwnerEntry = {
  id: string
  ownerName: string
  ownedFrom: string
  ownedTo: string | null
}

export default function OwnersPopover({ owners }: { owners: OwnerEntry[] }) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
        <UsersIcon className="w-3.5 h-3.5" />
        {owners.length} {owners.length === 1 ? 'owner' : 'owners'}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-3 w-auto max-w-xs">
        <ol className="space-y-1.5">
          {owners.map((entry, i) => (
            <li key={entry.id} className="text-xs">
              <span className="font-medium">{entry.ownerName}</span>
              <span className="text-muted-foreground">
                {' — '}
                {new Date(entry.ownedFrom).toLocaleDateString('uk-UA')}
                {entry.ownedTo
                  ? ` → ${new Date(entry.ownedTo).toLocaleDateString('uk-UA')}`
                  : ' → now'}
              </span>
              {i === owners.length - 1 && (
                <span className="ml-1 text-primary">(current)</span>
              )}
            </li>
          ))}
        </ol>
      </PopoverContent>
    </Popover>
  )
}
