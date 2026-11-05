'use client'

import { useEffect, useRef, useState } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { toggle } = useSidebar()
  const router = useRouter()
  const supabase = createClient()
  const [logoutPending, setLogoutPending] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const logoutInFlight = useRef(false)
  const logoutErrorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (logoutError) logoutErrorRef.current?.focus()
  }, [logoutError])

  async function handleLogout() {
    if (logoutInFlight.current) return
    logoutInFlight.current = true
    setLogoutPending(true)
    setLogoutError('')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth/login')
      router.refresh()
    } catch {
      setLogoutError('Não foi possível confirmar o encerramento da sessão. Tente novamente.')
      logoutErrorRef.current?.focus()
    } finally {
      logoutInFlight.current = false
      setLogoutPending(false)
    }
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

      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleLogout}
          disabled={logoutPending}
          aria-busy={logoutPending}
          aria-describedby={logoutError ? 'logout-error' : undefined}
          className="text-sm text-[#6B7280] hover:text-[#1A1D26] px-3 py-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {logoutPending ? 'Encerrando…' : logoutError ? 'Tentar sair novamente' : 'Sair'}
        </button>
        {logoutError && (
          <p id="logout-error" ref={logoutErrorRef} role="alert" tabIndex={-1} className="max-w-xs text-right text-xs text-red-700">
            {logoutError}
          </p>
        )}
      </div>
    </header>
  )
}
