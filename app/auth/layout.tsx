export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFBFC]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#B8860B]">Daily Prophet</h1>
          <p className="text-sm text-[#6B7280] mt-1">Hotels Marketing System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
