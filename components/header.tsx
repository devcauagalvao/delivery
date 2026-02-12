"use client"

import React, { useState } from 'react'
import { Search, Bell, LogOut, LogIn, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  user?: any
  profile?: any
  signOut?: () => Promise<void>
}

function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search className="w-4 h-4" />
      </span>
      <Input
        placeholder="Buscar hambúrgueres..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 h-11 w-full bg-[#111]/70 border border-[#222] text-gray-200 placeholder:text-gray-500 rounded-xl"
      />
    </div>
  )
}

export default function Header({ searchQuery, setSearchQuery, user, profile, signOut }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifications: { id: string; message: string; status?: string }[] = []

  const handleSignOut = async () => {
    if (!signOut) return
    try {
      await signOut()
    } catch (err) {
      console.error(err)
    }
  }

  const buttonStyles = 'px-3 py-1 rounded-md text-sm'

  return (
    <motion.header className="sticky top-0 z-50 w-full border-b border-[#222] bg-[#0b0b0b]/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuOpen((s) => !s)} className="md:hidden p-2 rounded-md text-gray-300 hover:bg-white/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-3">
            <Image src="/taurus-black-burguer/logo-taurus.png" alt="Taurus" width={44} height={44} className="object-contain" />
            <span className="hidden sm:inline font-extrabold text-lg tracking-tight text-white">Taurus Black</span>
          </Link>
        </div>

        <div className="flex-1 mx-4 hidden md:flex items-center">
          <SearchField value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="flex items-center gap-3">
          <Link href="/orders" className="hidden sm:inline text-sm text-gray-300 hover:text-white">Meus Pedidos</Link>

          {user && (
            <div className="relative">
              <button onClick={() => setNotifOpen((s) => !s)} aria-label="Notificações" className="p-2 rounded-md text-gray-300 hover:bg-white/5">
                <Bell className="w-5 h-5 text-[#cc9b3b]" />
                {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 mt-2 w-72 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 text-gray-400">Sem novas notificações</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="text-sm text-gray-300 hover:text-white">{profile?.full_name ?? 'Perfil'}</Link>
              {profile?.role === 'admin' && (
                <Link href="/admin">
                  <button className={`${buttonStyles} bg-[#222]/70 text-[#cc9b3b] border border-[#cc9b3b]`}>Admin</button>
                </Link>
              )}
              <button onClick={handleSignOut} className={`${buttonStyles} bg-[#cc9b3b]/10 text-[#cc9b3b]`}>Sair</button>
            </div>
          ) : (
            <Link href="/auth">
              <button className={`${buttonStyles} bg-[#159ADD]/10 text-[#159ADD]`}>
                <LogIn className="w-4 h-4 inline" /> <span className="ml-2">Entrar</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden px-4 py-3 border-t border-white/6 bg-[#070707]/60 backdrop-blur-sm">
            <div className="w-full mb-3">
              <Input placeholder="Buscar hambúrgueres..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/orders" className="text-sm text-gray-300">Meus Pedidos</Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-sm text-gray-300">Perfil</Link>
                  <button onClick={handleSignOut} className="text-sm text-left text-gray-300">Sair</button>
                </>
              ) : (
                <Link href="/auth" className="text-sm text-gray-300">Entrar</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
