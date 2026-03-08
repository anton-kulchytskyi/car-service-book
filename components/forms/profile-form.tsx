'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

type FieldErrors = Partial<Record<string, string[]>>

export default function ProfileForm({ name }: { name: string }) {
  const t = useTranslations('profileForm')
  const router = useRouter()

  // Name section
  const [nameValue, setNameValue] = useState(name)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [isNamePending, startNameTransition] = useTransition()

  // Password section
  const [pwErrors, setPwErrors] = useState<FieldErrors>({})
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwGlobalError, setPwGlobalError] = useState<string | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [isPwPending, startPwTransition] = useTransition()

  function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError(null)
    setNameSuccess(false)
    startNameTransition(async () => {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'name', name: nameValue }),
      })
      if (res.ok) {
        setNameSuccess(true)
        router.refresh()
      } else {
        setNameError(t('nameError'))
      }
    })
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwErrors({})
    setPwGlobalError(null)
    setPwSuccess(false)
    const form = new FormData(e.currentTarget)
    startPwTransition(async () => {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password',
          currentPassword: form.get('currentPassword'),
          newPassword: form.get('newPassword'),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPwSuccess(true)
        ;(e.target as HTMLFormElement).reset()
      } else if (typeof data.error === 'object') {
        setPwErrors(data.error)
      } else {
        setPwGlobalError(t('passwordError'))
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('nameTitle')}</CardTitle>
        </CardHeader>
        <form onSubmit={handleNameSubmit}>
          <CardContent className="flex flex-col gap-3">
            {nameError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{nameError}</p>
            )}
            {nameSuccess && (
              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">{t('nameSuccess')}</p>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                value={nameValue}
                onChange={(e) => { setNameValue(e.target.value); setNameSuccess(false) }}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button type="submit" size="sm" disabled={isNamePending || nameValue === name}>
              {isNamePending ? t('saving') : t('saveName')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('passwordTitle')}</CardTitle>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="flex flex-col gap-4">
            {pwGlobalError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{pwGlobalError}</p>
            )}
            {pwSuccess && (
              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">{t('passwordSuccess')}</p>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">{t('currentPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {pwErrors.currentPassword && (
                <p className="text-sm text-destructive">{pwErrors.currentPassword[0]}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">{t('newPasswordLabel')}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{t('passwordHint')}</p>
              {pwErrors.newPassword && (
                <p className="text-sm text-destructive">{pwErrors.newPassword[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button type="submit" size="sm" disabled={isPwPending}>
              {isPwPending ? t('saving') : t('updatePassword')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
