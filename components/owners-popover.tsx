'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UsersIcon } from 'lucide-react'

type OwnerEntry = {
  id: string
  ownerName: string
  ownedFrom: Date | string
  ownedTo: Date | string | null
}

export default function OwnersPopover({ owners }: { owners: OwnerEntry[] }) {
  const t = useTranslations('ownersPopover')
  const locale = useLocale()

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
        <UsersIcon className="w-3.5 h-3.5" />
        {t('owner', { count: owners.length })}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-3 w-auto max-w-xs">
        <ol className="space-y-1.5">
          {owners.map((entry, i) => (
            <li key={entry.id} className="text-xs">
              <span className="font-medium">{entry.ownerName}</span>
              <span className="text-muted-foreground">
                {' — '}
                {new Date(entry.ownedFrom).toLocaleDateString(locale)}
                {entry.ownedTo
                  ? ` → ${new Date(entry.ownedTo).toLocaleDateString(locale)}`
                  : ` → ${t('now')}`}
              </span>
              {i === owners.length - 1 && (
                <span className="ml-1 text-primary">{t('current')}</span>
              )}
            </li>
          ))}
        </ol>
      </PopoverContent>
    </Popover>
  )
}
