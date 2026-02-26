export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Daily Prophet</h1>
          <p className="text-sm text-zinc-400 mt-1">Hotels Marketing System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
