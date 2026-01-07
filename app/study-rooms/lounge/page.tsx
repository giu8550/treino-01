'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

export default function LoungeRoomPage() {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#050505] font-mono text-white">

            {/* BACKGROUND MOCK */}
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-purple-950 via-[#0a0a0a] to-pink-950">
                <Image
                    src="/assets/lounge-room.png" // Imagem futura
                    alt="Cyber Lounge"
                    fill
                    className={`object-cover object-center transition-opacity duration-1000 ${imgLoaded ? 'opacity-70' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)}
                    priority
                />
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />
                )}
            </div>

            {/* CONTEÚDO */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full p-4">

                {/* Visual Glitch Effect Mock */}
                <div className="relative group cursor-default">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative px-10 py-8 bg-black/50 backdrop-blur-xl ring-1 ring-white/10 rounded-lg leading-none flex flex-col items-center">
                        <MusicalNoteIcon className="w-10 h-10 text-pink-500 mb-4 animate-bounce" />
                        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                            NEON LOUNGE
                        </h1>
                        <p className="text-xs text-purple-300 font-bold uppercase tracking-[0.4em]">
                            Área de Descompressão
                        </p>
                    </div>
                </div>

                <Link
                    href="/workstation"
                    className="mt-12 flex items-center gap-3 text-white/40 hover:text-pink-400 transition-colors uppercase text-[10px] tracking-[0.2em] font-bold"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Sair do Lounge
                </Link>
            </div>
        </div>
    );
}