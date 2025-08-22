'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OrdersTab from './orders-tab'
import UsersTab from './users-tab'
import ProductsTab from './products-tab'
import { OrderWithItems } from '@/lib/supabase'
import { X, Home, Menu } from 'lucide-react'

interface AdminSidebarProps {
    orders: OrderWithItems[]
    setSelectedOrderId: (id: string) => void
    goBack: () => void
}

export default function AdminSidebar({ orders, setSelectedOrderId, goBack }: AdminSidebarProps) {
    const [tab, setTab] = useState<'orders' | 'users' | 'products'>('orders')
    const [isOpen, setIsOpen] = useState(false)

    const tabs = [
        { key: 'orders', label: 'Pedidos' },
        { key: 'users', label: 'Usuários' },
        { key: 'products', label: 'Produtos' }
    ]

    return (
        <>
            {/* Botão flutuante para abrir sidebar */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-6 z-50 bg-black/80 text-white p-3 rounded-full shadow-lg hover:bg-black/90 transition-all duration-200"
            >
                <Menu className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {/* Overlay */}
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Sidebar com glassmorphism */}
                {isOpen && (
                    <motion.div
                        className="fixed top-0 left-0 h-full w-80 bg-black/50 backdrop-blur-lg border-r border-white/20 shadow-2xl z-50 flex flex-col"
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Cabeçalho */}
                        <div className="flex items-center justify-between p-5 border-b border-white/20">
                            <button
                                onClick={goBack}
                                className="flex items-center gap-2 bg-[#cc9b3b] text-black px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#e6b95b] transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                Principal
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-col flex-1 overflow-y-auto">
                            <div className="flex flex-col p-4 gap-2">
                                {tabs.map(t => (
                                    <motion.button
                                        key={t.key}
                                        onClick={() => setTab(t.key as any)}
                                        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${tab === t.key
                                                ? 'bg-[#cc9b3b]/90 text-black shadow-lg'
                                                : 'text-white hover:bg-white/10'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {t.label}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Conteúdo das tabs */}
                            <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-black/40">
                                {tab === 'orders' && <OrdersTab orders={orders} setSelectedOrderId={setSelectedOrderId} />}
                                {tab === 'users' && <UsersTab />}
                                {tab === 'products' && <ProductsTab />}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
