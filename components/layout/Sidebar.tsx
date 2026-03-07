'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/SidebarContext'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface NavSection {
  label: string | null
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Core',
    items: [
      { href: '/dashboard', label: 'Posto de Comando', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { href: '/dashboard/meu-hotel', label: 'Meu Hotel', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    ],
  },
  {
    label: 'Planejamento',
    items: [
      { href: '/dashboard/post-do-dia', label: 'Post do Dia', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
      { href: '/dashboard/calendario', label: 'Calendário', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { href: '/dashboard/campanhas', label: 'Campanhas', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
      { href: '/dashboard/sazonal', label: 'Sazonal', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    label: 'Conteudo',
    items: [
      { href: '/dashboard/gerador', label: 'Gerador', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { href: '/dashboard/biblioteca', label: 'Biblioteca', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
      { href: '/dashboard/hashtags', label: 'Hashtags', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
    ],
  },
  {
    label: 'Execucao',
    items: [
      { href: '/dashboard/missoes', label: 'Missoes', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
      { href: '/dashboard/execucao', label: 'Tarefas da Semana', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    ],
  },
  {
    label: 'Inteligencia',
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { href: '/dashboard/benchmarks', label: 'Benchmarks', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F8F9FB] border-r border-[#E5E7EB] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#B8860B]">Daily Prophet</h2>
          <p className="text-xs text-[#9CA3AF]">Hotels — OS de Conteudo</p>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-72px)]">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx}>
              {section.label && (
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-3 pt-4 pb-1">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[#FFF8E7] text-[#B8860B] font-medium'
                        : 'text-[#6B7280] hover:text-[#1A1D26] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
