'use client'

import React from 'react'
import { MessageCircle, Facebook, Instagram } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full py-6 bg-[#111111]/40 backdrop-blur-md backdrop-saturate-150 border-t border-[#222] text-gray-300 flex flex-col sm:flex-row items-center sm:items-start justify-between px-6 gap-4 sm:gap-0">

            {/* Esquerda: Copyright com link */}
            <p className="text-sm text-center sm:text-left">
                &copy; {currentYear}{' '}
                <Link
                    href="https://www.glvinformatica.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline decoration-red-500 underline-offset-2"
                >
                    GLV Informática e Desenvolvimento
                </Link>
                . Todos os direitos reservados.
            </p>

            {/* Direita: Redes sociais */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
                <a
                    href="https://wa.me/5511934864733"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#25D366] hover:text-[#1ebe5a] transition-colors"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">WhatsApp</span>
                </a>
                <a
                    href="https://www.facebook.com/people/Taurus-Black-Burguers/61577198759461/?ref=pl_edit_xav_ig_profile_page_web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#1877F2] hover:text-[#155dbf] transition-colors"
                >
                    <Facebook className="w-5 h-5" />
                    <span className="text-sm">Facebook</span>
                </a>
                <a
                    href="https://www.instagram.com/taurus_black_burguer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#E1306C] hover:text-[#c1275b] transition-colors"
                >
                    <Instagram className="w-5 h-5" />
                    <span className="text-sm">Instagram</span>
                </a>
            </div>
        </footer>
    )
}
