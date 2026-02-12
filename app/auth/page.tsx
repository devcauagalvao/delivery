'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Hamburger
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Tipagem do formulário
interface FormData {
  email: string
  password: string
  fullName: string
  phone: string
}

// Fundo animado responsivo
function AnimatedBackground() {
  const [iconCount, setIconCount] = useState(0)

  useEffect(() => {
    const calcIcons = () => {
      const iconSize = 40 // px
      const cols = Math.ceil(window.innerWidth / iconSize)
      const rows = Math.ceil(window.innerHeight / iconSize)
      setIconCount(cols * rows)
    }

    calcIcons()
    window.addEventListener('resize', calcIcons)
    return () => window.removeEventListener('resize', calcIcons)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 z-0">
      {Array.from({ length: iconCount }).map((_, i) => (
        <motion.div
          key={i}
          className="flex justify-center items-center w-8 h-8"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        >
          <Hamburger className="text-[#cc9b3b] w-10 h-10" />
        </motion.div>
      ))}
    </div>
  )
}

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error

        if (data.user) {
          // Não criar profile automaticamente para usuários públicos/cliente.
          // O novo schema usa profiles apenas para contas administrativas (admin/operator).
          // Portanto, não fazemos insert em `profiles` aqui para evitar constraint violations.
          toast.success('Conta criada com sucesso! Verifique seu e-mail para confirmação.')
          router.push('/')
        }
      } else {
        // Set session persistence based on rememberMe
        // Supabase JS v2: persistence is set via options in signInWithPassword
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
          options: {
            // 'local' = lembrar, 'session' = não lembrar
            // @ts-ignore
            persistSession: rememberMe
          }
        })
        if (error) throw error
        toast.success('Login realizado com sucesso!')
        router.push('/')
      }
    } catch (err: any) {
      toast.error(err.message || 'Ocorreu um erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#111111] relative overflow-hidden">
      {/* Fundo animado */}
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-lg">
            <div className="text-center mb-8 flex flex-col items-center">
              <img src="/taurus-black-burguer/logo-taurus.png" alt="Logo" className="w-32 h-auto mb-2" />
              <p className="text-white font-semibold text-lg">
                {isSignUp ? 'Crie sua conta' : 'Faça seu login'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Nome completo"
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="pl-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-[#cc9b3b] focus:ring-2 focus:ring-[#cc9b3b]/50 rounded-full transition-all"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
                    <Input
                      type="tel"
                      placeholder="Telefone"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-[#cc9b3b] focus:ring-2 focus:ring-[#cc9b3b]/50 rounded-full transition-all"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-[#cc9b3b] focus:ring-2 focus:ring-[#cc9b3b]/50 rounded-full transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-12 pr-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-[#cc9b3b] focus:ring-2 focus:ring-[#cc9b3b]/50 rounded-full transition-all"
                  required
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>

              {/* Lembrar de mim */}
              {!isSignUp && (
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="accent-[#cc9b3b] w-4 h-4 rounded focus:ring-2 focus:ring-[#cc9b3b]/50 border border-[#333] bg-[#1a1a1a]/20"
                  />
                  <label htmlFor="rememberMe" className="text-white text-sm select-none cursor-pointer">
                    Lembrar de mim
                  </label>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#cc9b3b] hover:bg-[#b68830] text-black font-bold rounded-full py-3 shadow-lg transition-all duration-300"
              >
                {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white hover:underline font-medium"
              >
                {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-white hover:text-[#cc9b3b] underline">
                Voltar ao cardápio
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}