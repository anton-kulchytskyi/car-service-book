'use client'

import { useState, useTransition } from 'react'
import { useRouter, Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

type FieldErrors = Partial<Record<string, string[]>>

export default function RegisterForm() {
  const t = useTranslations('register')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGlobalError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
    }

    startTransition(async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else if (typeof data.error === 'object') {
        setFieldErrors(data.error)
      } else {
        setGlobalError(t('error'))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {globalError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{globalError}</p>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input id="name" name="name" placeholder={t('namePlaceholder')} required autoComplete="name" />
            {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input id="email" name="email" type="email" placeholder={t('emailPlaceholder')} required autoComplete="email" />
            {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} minLength={8} required autoComplete="new-password" className="pr-10" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
            {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t('submitting') : t('submit')}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {t('hasAccount')}{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
              {t('signInLink')}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground text-center">
            <Link href="/demo" className="underline underline-offset-4 hover:text-foreground">
              {t('seeDemo')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
