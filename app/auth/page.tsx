'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Hamburger } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // Criação de usuário
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error

        // Inserir perfil
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              full_name: formData.fullName,
              phone: formData.phone,
              role: 'customer'
            }])
          if (profileError) throw profileError

          toast.success('Conta criada com sucesso!')
          router.push('/')
        }
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        toast.success('Login realizado com sucesso!')
        router.push('/')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a1a] relative overflow-hidden">
      {/* Fundo animado */}
      <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-6 gap-6">
        {Array.from({ length: 36 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex justify-center items-center"
            animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          >
            <Hamburger className="text-[#cc9b3b] w-6 h-6" />
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="relative p-8 bg-[#1a1a1a]/40 backdrop-blur-md border border-white/20 rounded-3xl">
            <div className="text-center mb-8 flex flex-col items-center">
              <img src="/taurus-black-burguer/logo-taurus.png" alt="Logo" className="w-32 h-auto mb-2" />
              <p className="text-white">{isSignUp ? 'Crie sua conta' : 'Faça seu login'}</p>
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
                      className="pl-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
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
                      className="pl-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
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
                  className="pl-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
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
                  className="pl-12 pr-12 bg-[#1a1a1a]/20 border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#cc9b3b] hover:bg-[#b68830] text-black font-bold rounded-full py-3"
              >
                {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-white hover:underline">
                {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-white hover:text-white underline">Voltar ao cardápio</Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
