'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Importando dinamicamente o Hamburger do Lucide
import dynamic from 'next/dynamic'
const Hamburger = dynamic(() => import('lucide-react').then(mod => mod.Hamburger), { ssr: false })

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
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
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
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        toast.success('Login realizado com sucesso!')
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#1a1a1a] relative overflow-hidden">
      {/* Pattern de hambúrgueres animados no fundo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-8">
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex justify-center items-center"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 15, -15, 0]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                repeatType: 'loop',
                delay: Math.random() * 2
              }}
            >
              <Hamburger className="text-[#cc9b3b] w-8 h-8" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="relative p-8 z-10 bg-white/5 border border-white/20 rounded-3xl backdrop-blur-xl">
            <div className="text-center mb-8 flex flex-col items-center">
              <img
                src="/taurus-black-burguer/logo-taurus.png"
                alt="Taurus Black Burguer's"
                className="w-32 h-auto mb-2"
              />
              <p className="text-white">{isSignUp ? 'Crie sua conta' : 'Faça seu login'}</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Nome completo"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="pl-12 bg-[#1a1a1a] border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                    <Input
                      type="tel"
                      placeholder="Telefone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-12 bg-[#1a1a1a] border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-12 bg-[#1a1a1a] border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-12 pr-12 bg-[#1a1a1a] border border-[#333] text-white placeholder:text-white/50 focus:border-white focus:ring-white rounded-full"
                  required
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#cc9b3b] hover:bg-[#b68830] text-black font-bold rounded-full py-3"
              >
                {loading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white hover:underline"
              >
                {isSignUp
                  ? 'Já tem conta? Faça login'
                  : 'Não tem conta? Cadastre-se'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-white hover:text-white underline">
                Voltar ao cardápio
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}