// src/app/admin/(protected)/configuracoes/page.tsx
import { getCachedSiteSettings } from '@/lib/cache'
import ConfiguracoesClient from './ConfiguracoesClient'

export default async function ConfiguracoesPage() {
  const settings = await getCachedSiteSettings()
  return <ConfiguracoesClient settings={settings} />
}
