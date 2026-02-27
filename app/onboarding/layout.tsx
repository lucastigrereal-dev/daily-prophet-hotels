export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3">
        <h1 className="text-lg font-bold text-[#B8860B]">Daily Prophet Hotels</h1>
        <p className="text-xs text-[#9CA3AF]">Cadastro de Hotel</p>
      </header>
      <main className="max-w-lg mx-auto p-4 pb-24">{children}</main>
    </div>
  )
}
