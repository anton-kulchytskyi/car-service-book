import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

export async function redirectToLogin(): Promise<never> {
  const locale = await getLocale()
  redirect(`/${locale}/login`)
}

export async function redirectToDashboard(): Promise<never> {
  const locale = await getLocale()
  redirect(`/${locale}/dashboard`)
}
