'use client'

import React, { useState, useEffect } from 'react'
import { Search, Shield, LogOut, LogIn, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useRef } from 'react'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  user: any
  profile: any
  signOut: () => Promise<void>
}

interface Notification {
  id: string
  message: string
  status: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const statusMap: Record<string, string> = {
  accepted: 'Aceito',
  preparing: 'Em preparo',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado'
}

async function fetchOrderNotifications() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, order_items(id, product:products(name), quantity)')
    .in('status', ['accepted', 'preparing', 'out_for_delivery', 'delivered'])

  if (error) {
    console.error('Erro ao buscar pedidos:', error)
    return []
  }

  return data.map((order: any) => ({
    id: order.id,
    message: `Pedido #${order.id.slice(0, 8)} - Itens: ${order.order_items
      .map((i: any) => `${i.product?.name || 'Produto desconhecido'} x${i.quantity}`)
      .join(', ')}`,
    status: statusMap[order.status] || order.status
  })) as Notification[]
}

// ==========================
// Styled Components
// ==========================
const StyledWrapper = styled.div`
  .hamburger {
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .hamburger input {
    display: none;
  }

  .hamburger svg {
    height: 2.5em;
    width: 2.5em;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line {
    fill: none;
    stroke: white;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    transition: stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line-top-bottom {
    stroke-dasharray: 12 63;
  }

  .hamburger input:checked + svg {
    transform: rotate(-45deg);
  }

  .hamburger input:checked + svg .line-top-bottom {
    stroke-dasharray: 20 300;
    stroke-dashoffset: -32.42;
  }
`

// ==========================
// Header Component
// ==========================
export default function Header({
  searchQuery,
  setSearchQuery,
  user,
  profile,
  signOut
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const handleSignOut = async () => {
    try {
      await signOut()
      setMenuOpen(false)
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  useEffect(() => {
    if (!user) return

    let previousOrders: Record<string, string> = {} // guarda status anterior dos pedidos

    const updateNotifications = async () => {
      const notifs = await fetchOrderNotifications()
      setNotifications(notifs)

      // Verifica se algum pedido do usuário passou de pendente para aceito
      notifs.forEach((notif) => {
        // Só considera pedidos do usuário logado
        // Se você tiver o user id nos pedidos, substitua order.id pelo user_id
        const prevStatus = previousOrders[notif.id]
        if (prevStatus === 'pending' && notif.status === 'Aceito') {
          toast.success(`Seu pedido #${notif.id.slice(0, 8)} foi aceito!`)
        }
        previousOrders[notif.id] = notif.status
      })
    }

    updateNotifications()

    const interval = setInterval(updateNotifications, 10000) // a cada 10s

    // Realtime para atualizações instantâneas
    const channel = supabase
      .channel('orders_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          if (!payload.new) return
          const notifs = await fetchOrderNotifications()
          setNotifications(notifs)

          // Toast instantâneo
          notifs.forEach((notif) => {
            const prevStatus = previousOrders[notif.id]
            if (prevStatus === 'pending' && notif.status === 'Aceito') {
              toast.success(`Seu pedido #${notif.id.slice(0, 8)} foi aceito!`)
            }
            previousOrders[notif.id] = notif.status
          })
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [user])

  const buttonStyles =
    'group flex items-center justify-center px-4 py-2 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-black/50 hover:shadow-[#cc9b3b]/50 hover:scale-105 hover:backdrop-brightness-125 backdrop-blur-md'

  return (
    <motion.header className="sticky top-0 z-50 w-full border-b border-[#222222] bg-[#111111]/50 backdrop-blur-lg backdrop-saturate-150 shadow-lg">
      <div className="w-full px-4 sm:px-6 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="w-24 md:w-48 flex-shrink-0">
          <Link href="/">
            <Image
              src="/taurus-black-burguer/logo-taurus.png"
              alt="Logo Taurus Black Burgers"
              width={80}
              height={80}
              className="object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Menu desktop */}
        <div className="hidden md:flex flex-1 items-center gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">
              <Search className="w-5 h-5" />
            </span>
            <Input
              placeholder="Buscar hambúrgueres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 w-full bg-[#1a1a1a]/60 border border-[#333333] text-gray-200 placeholder:text-gray-500 rounded-2xl shadow-md shadow-black/40 backdrop-blur-sm focus:border-[#cc9b3b] focus:ring-4 focus:ring-[#cc9b3b]/40 transition-all duration-300 hover:bg-[#1a1a1a]/70"
            />
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 relative">
            {/* Notificações */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-full bg-[#1a1a1a]/60 hover:bg-[#1a1a1a]/80 transition-colors"
                >
                  <Bell className="w-6 h-6 text-[#cc9b3b]" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-[#1a1a1a]/90 border border-[#333] rounded-xl shadow-lg shadow-black/50 z-50 overflow-hidden"
                    >
                      {notifications.length === 0 ? (
                        <div className="text-gray-400 p-4 text-center">
                          Sem novas notificações
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="px-4 py-3 border-b border-[#333] text-white text-sm hover:bg-[#222]/40 transition-colors cursor-pointer"
                          >
                            {notif.message}{' '}
                            <span className="text-[#cc9b3b] font-medium">({notif.status})</span>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 hidden sm:inline">
                  Olá, {profile?.full_name}
                </span>

                {profile?.role === 'admin' && (
                  <Link href="https://delivery-admin-fawn.vercel.app">
                    <button
                      className={`${buttonStyles} bg-[#222222]/70 text-[#cc9b3b] border border-[#cc9b3b]`}
                    >
                      <Shield className="w-5 h-5 shrink-0 transition-all duration-300" strokeWidth={3} />
                      <span className="ml-2">Admin</span>
                    </button>
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className={`${buttonStyles} bg-[#cc9b3b]/20 text-[#cc9b3b] border border-[#cc9b3b]`}
                >
                  <LogOut className="w-5 h-5 shrink-0 transition-all duration-300" strokeWidth={3} />
                  <span className="ml-2">Sair</span>
                </button>
              </div>
            ) : (
              <Link href="/auth">
                <button
                  className={`${buttonStyles} bg-[#159ADD]/30 text-[#159ADD] border border-[#159ADD]`}
                >
                  <LogIn className="w-5 h-5 shrink-0 transition-all duration-300" strokeWidth={3} />
                  <span className="ml-2">Entrar</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        <div className="md:hidden">
          <StyledWrapper>
            <label className="hamburger">
              <input type="checkbox" checked={menuOpen} onChange={() => setMenuOpen(!menuOpen)} />
              <svg viewBox="0 0 32 32">
                <path
                  className="line line-top-bottom"
                  d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                />
                <path className="line" d="M7 16 27 16" />
              </svg>
            </label>
          </StyledWrapper>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden px-4 sm:px-6 md:px-8 py-4 backdrop-blur-lg backdrop-saturate-150 bg-[#111111]/60 border-t border-[#222222] flex flex-col gap-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar hambúrgueres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 w-full bg-[#1a1a1a]/60 border border-[#333333] text-gray-200 placeholder:text-gray-500 rounded-xl shadow-inner"
              />
            </div>

            {user ? (
              <>
                <span className="text-gray-400">Olá, {profile?.full_name}</span>
                {profile?.role === 'admin' && (
                  <Link href="/admin">
                    <button className={`${buttonStyles} w-full bg-[#222222]/70 text-[#cc9b3b] border border-[#cc9b3b]`}>
                      Admin
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className={`${buttonStyles} w-full bg-[#cc9b3b]/20 text-[#cc9b3b] border border-[#cc9b3b]`}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link href="/auth">
                <button
                  className={`${buttonStyles} w-full bg-[#159ADD]/30 text-[#159ADD] border border-[#159ADD]`}
                >
                  Entrar
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
