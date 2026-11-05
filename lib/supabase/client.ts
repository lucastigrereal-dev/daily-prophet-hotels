import { publicConfig } from './config'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const config = publicConfig()
  return createBrowserClient(
    config.url,
    config.key
  )
}
