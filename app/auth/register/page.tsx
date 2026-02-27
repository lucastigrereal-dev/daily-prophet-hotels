'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome_completo: nome },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base transition-colors"
            placeholder="Seu nome"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base transition-colors"
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base transition-colors"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#B8860B] hover:brightness-110 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white font-semibold rounded-lg transition-all text-base"
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </div>

      <p className="text-center text-sm text-[#6B7280]">
        Já tem conta?{' '}
        <Link href="/auth/login" className="text-[#B8860B] hover:text-[#DAA520] font-medium">
          Entrar
        </Link>
      </p>
    </form>
  )
}
