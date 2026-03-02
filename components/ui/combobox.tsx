'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
}

export default function Combobox({ options, value, onChange, placeholder = 'Select...', searchPlaceholder = 'Search...' }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
  const exactMatch = options.some((o) => o.toLowerCase() === search.toLowerCase())
  const showCustom = search.trim() && !exactMatch

  function select(option: string) {
    onChange(option)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!value && 'text-muted-foreground')}>{value || placeholder}</span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {showCustom && (
              <CommandGroup heading="Custom">
                <CommandItem value={`__custom__${search}`} onSelect={() => select(search.trim())}>
                  Use &ldquo;{search.trim()}&rdquo;
                </CommandItem>
              </CommandGroup>
            )}
            {filtered.length > 0 && (
              <CommandGroup heading={showCustom ? 'Suggestions' : undefined}>
                {filtered.map((option) => (
                  <CommandItem key={option} value={option} onSelect={() => select(option)}>
                    <CheckIcon className={cn('mr-2 h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')} />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
