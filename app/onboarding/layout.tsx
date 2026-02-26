export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold text-amber-500">Daily Prophet Hotels</h1>
        <p className="text-xs text-zinc-500">Cadastro de Hotel</p>
      </header>
      <main className="max-w-lg mx-auto p-4 pb-24">{children}</main>
    </div>
  )
}
