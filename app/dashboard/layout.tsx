import { ownerContext } from '@/lib/hotel/server-access'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { SidebarProvider } from '@/contexts/SidebarContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { hotel } = await ownerContext()
  if (!hotel || !hotel.onboarding_completo) redirect('/onboarding')
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
