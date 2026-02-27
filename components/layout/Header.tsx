'use client'

import { useSidebar } from '@/contexts/SidebarContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { toggle } = useSidebar()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 text-[#6B7280] hover:text-[#1A1D26]"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#B8860B]">Daily Prophet</h1>
      </div>

      <button
        onClick={handleLogout}
        className="text-sm text-[#6B7280] hover:text-[#1A1D26] px-3 py-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
      >
        Sair
      </button>
    </header>
  )
}
