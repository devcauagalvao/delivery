'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Defina a interface Profile de acordo com sua tabela 'profiles'
export interface Profile {
  id: string
  full_name?: string
  phone?: string
  created_at?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return null
      }

      setProfile(data)
      return data
    } catch (err) {
      console.error('Erro inesperado ao buscar perfil:', err)
      return null
    }
  }

  // Inicializa sessão
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Erro ao obter sessão:', error)
      }

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
      }

      setLoading(false)
    }

    initAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser)

        if (newUser) {
          await fetchProfile(newUser.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Função para deslogar
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Erro ao sair:', error)
  }

  // Memoiza o contexto para evitar re-renderizações desnecessárias
  const value = useMemo(() => ({ user, profile, loading, signOut }), [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para consumir o AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
