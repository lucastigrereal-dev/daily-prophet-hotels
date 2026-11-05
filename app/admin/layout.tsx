import { createClient } from '@/lib/supabase/server'
import { internalAdmin } from '@/lib/hotel/v2/domain'
import { notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { SidebarProvider } from '@/contexts/SidebarContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const client = await createClient()
  const { data, error } = await client.auth.getUser()
  try { if (error) throw error; internalAdmin(data.user) } catch { notFound() }
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#FAFBFC]">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
      </div>
    </SidebarProvider>
  )
}
