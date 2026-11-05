import { publicConfiguration } from '@/lib/hotel/v2/domain'
export function publicConfig() {
  return publicConfiguration({ NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY })
}
