'use client'

import React from 'react'
import { Search, Shield, LogOut, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'

interface HeaderProps {
    searchQuery: string
    setSearchQuery: (v: string) => void
    user: any
    profile: any
    signOut: () => Promise<void>
}

const StyledWrapper = styled.div`
  .hamburger {
    cursor: pointer;
  }

  .hamburger input {
    display: none;
  }

  .hamburger svg {
    height: 3em;
    transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line {
    fill: none;
    stroke: white;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
      stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
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

export default function Header({
    searchQuery,
    setSearchQuery,
    user,
    profile,
    signOut,
}: HeaderProps) {
    const [menuOpen, setMenuOpen] = React.useState(false)

    return (
        <>
            <motion.header className="sticky top-0 z-20 w-full border-b border-[#222222] bg-[#111111]/40 backdrop-blur-md backdrop-saturate-150">
                <div
                    className="w-full px-4 sm:px-6 md:px-8 py-2 md:py-4 flex items-center justify-between gap-4"
                >
                    <div
                        className="w-24 md:w-48 flex-shrink-0"
                    >
                        <Image
                            src="/taurus-black-burguer/logo-taurus.png"
                            alt="Logo Taurus Black Burgers"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>

                    <div className="hidden md:flex flex-1 items-center gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5">
                                <Search className="w-5 h-5" />
                            </span>

                            <Input
                                placeholder="Buscar hambúrgueres..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 h-12 w-full bg-[#1a1a1a]/60 border border-[#333333] text-gray-200 placeholder:text-gray-500 rounded-2xl shadow-md shadow-black/40 backdrop-blur-sm focus:border-[#cc9b3b] focus:ring-4 focus:ring-[#cc9b3b]/40 focus-visible:outline-none transition-all duration-300 hover:bg-[#1a1a1a]/70"
                            />
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400 hidden sm:inline">Olá, {profile?.full_name}</span>

                                    {/* Botão Admin se o role for admin */}
                                    {profile?.role === "admin" && (
                                        <Link href="/admin">
                                            <Button variant="admin">
                                                <Shield className="w-5 h-5 shrink-0" strokeWidth={4} />
                                                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                                                    Admin
                                                </span>
                                            </Button>
                                        </Link>
                                    )}

                                    {/* Botão Sair sempre que o usuário estiver logado */}
                                    <Button onClick={signOut} variant="logout">
                                        <LogOut className="w-5 h-5 shrink-0" strokeWidth={4} />
                                        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                                            Sair
                                        </span>
                                    </Button>
                                </div>
                            ) : (
                                <Link href="/auth">
                                    <Button variant="login">
                                        <LogIn className="w-5 h-5 shrink-0" strokeWidth={4} />
                                        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                                            Entrar
                                        </span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="md:hidden">
                        <StyledWrapper>
                            <label className="hamburger">
                                <input type="checkbox" checked={menuOpen} onChange={() => setMenuOpen(!menuOpen)} />
                                <svg viewBox="0 0 32 32">
                                    <path className="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22" />
                                    <path className="line" d="M7 16 27 16" />
                                </svg>
                            </label>
                        </StyledWrapper>
                    </div>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden px-4 sm:px-6 md:px-8 py-4 backdrop-blur-md backdrop-saturate-150 bg-[#111111]/60 border-t border-[#222222]"
                        >
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Buscar hambúrgueres..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-4 h-12 w-full bg-[#1a1a1a] border border-[#333333] text-gray-200 placeholder:text-gray-500 rounded-xl shadow-inner"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                {user ? (
                                    <>
                                        <span className="text-gray-400">Olá, {profile?.full_name}</span>
                                        {profile?.role === 'admin' && (
                                            <Link href="/admin">
                                                <Button variant="admin" className="w-full">
                                                    Admin
                                                </Button>
                                            </Link>
                                        )}
                                        <Button onClick={signOut} variant="logout" className="w-full">
                                            Sair
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/auth">
                                        <Button variant="login" className="w-full">
                                            Entrar
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </>
    )
}