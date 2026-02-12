"use client"

import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Edit3, Save, X, LogOut, Loader2, ArrowLeft, Hamburger } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

export default function ProfilePage() {
    const { user, profile, loading: authLoading, signOut } = useAuth()

    // NOTE: client-side updates to `profiles` are disabled for the public (guest) flow.
    // Profiles are used only for admin/operator accounts. Do not write to `profiles` from the public UI.
    const [form, setForm] = useState({ full_name: "", phone: "", address: "" })
    const router = useRouter()

    useEffect(() => {
        if (!profile) return
        setForm({
            full_name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            address: profile.address ?? ""
        })
    }, [profile])

    const initials = useMemo(() => {
        if (!form.full_name) return "?"
        return form.full_name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("")
    }, [form.full_name])

    // Função para formatar telefone brasileiro
    function formatPhone(phone: string) {
        // Remove tudo que não for dígito
        const digits = phone.replace(/\D/g, "");
        if (digits.length <= 2) return digits;
        if (digits.length <= 7)
            return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 11)
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "phone") {
            setForm((f) => ({ ...f, [name]: formatPhone(value) }));
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    }

    const handleSave = async () => {
        // intentionally disabled: public client must NOT write to `profiles` table.
        toast.error('Edição de perfil desabilitada no fluxo público (guest)')
    }

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-[#cc9b3b]">
                <motion.div className="mb-4" transition={{ repeat: Infinity, duration: 1 }}>
                    <Hamburger className="w-16 h-16" />
                </motion.div>
                <span className="text-lg font-bold">Carregando...</span>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-[70vh] bg-[#1a1a1a] flex flex-col items-center justify-center gap-4 text-gray-300">
                <p className="text-lg">Você não está logado.</p>
                <a
                    href="/auth"
                    className="px-4 py-2 rounded-xl border border-[#cc9b3b] text-[#cc9b3b] bg-[#cc9b3b]/10 hover:bg-[#cc9b3b]/20 transition"
                >
                    Fazer login
                </a>
            </div>
        )
    }

    return (
        <div className="min-h-[100dvh] bg-[#1a1a1a]">
            {/* Hero */}
            <div className="relative pt-10 pb-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#cc9b3b1a] via-transparent to-transparent" />
                <div className="max-w-5xl mx-auto px-4 relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#cc9b3b] hover:text-[#e0b85c] mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" /> Voltar
                    </button>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold text-white tracking-tight"
                    >
                        Meu Perfil
                    </motion.h1>
                    <p className="text-gray-400 mt-2">Gerencie suas informações e preferências.</p>
                </div>

            </div>

            {/* Card principal */}
            <div className="max-w-5xl mx-auto px-4 -mt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-[#2a2a2a] bg-[#111111]/80 backdrop-blur-xl shadow-2xl shadow-black/40"
                >
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                        {/* Avatar (iniciais) */}
                        <div className="flex flex-col items-center gap-4 md:w-56">
                            <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-[#cc9b3b] shadow-lg grid place-items-center bg-[#1f1f1f] text-[#cc9b3b] text-4xl font-semibold">
                                {initials}
                            </div>
                            <button
                                onClick={signOut}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-400 hover:bg-red-500/10 transition"
                            >
                                <LogOut className="w-4 h-4" /> Sair
                            </button>
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 grid gap-6">
                            {/* Header do card */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-semibold text-white mt-1">{form.full_name || "Seu nome"}</h2>
                                    <p className="text-gray-400 text-sm">{user?.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={signOut}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-400 hover:bg-red-500/10 transition"
                                    >
                                        <LogOut className="w-4 h-4" /> Sair
                                    </button>
                                </div>
                            </div>

                            {/* Campos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nome (somente leitura — edição desabilitada no fluxo público) */}
                                <div className="group rounded-xl border border-[#2a2a2a] bg-[#151515] p-4">
                                    <label className="text-xs uppercase tracking-wider text-gray-400">Nome</label>
                                    <div className="mt-1 text-gray-200">{form.full_name || "—"}</div>
                                </div>

                                {/* Telefone (somente leitura) */}
                                <div className="group rounded-xl border border-[#2a2a2a] bg-[#151515] p-4">
                                    <label className="text-xs uppercase tracking-wider text-gray-400">Telefone</label>
                                    <div className="mt-1 text-gray-200">{form.phone ? formatPhone(form.phone) : "—"}</div>
                                </div>

                                {/* Endereço (somente leitura) */}
                                <div className="group rounded-xl border border-[#2a2a2a] bg-[#151515] p-4 md:col-span-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-400">Endereço</label>
                                    <div className="mt-1 text-gray-200">{form.address || "—"}</div>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Este será o endereço padrão para entregas, mas pode ser alterado a qualquer momento.
                                    </p>
                                </div>

                                {/* Email */}
                                <div className="group rounded-xl border border-[#2a2a2a] bg-[#151515] p-4 md:col-span-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-400">E-mail</label>
                                    <div className="mt-1 text-gray-200 break-all">{user?.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="h-16" />
        </div>
    )
}
