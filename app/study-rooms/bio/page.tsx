'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, BeakerIcon } from '@heroicons/react/24/outline';

export default function BioRoomPage() {
    // Estado para controlar se a imagem carregou (Mock Logic)
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black font-mono text-white">

            {/* CAMADA 1: BACKGROUND / IMAGEM MOCK */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-950 via-black to-emerald-950">
                {/* A imagem tenta carregar. Se não existir em public/assets, o gradiente acima prevalece */}
                <Image
                    src="/assets/bio-room.png" // Coloque sua imagem aqui depois
                    alt="Bio Research Lab"
                    fill
                    className={`object-cover object-center transition-opacity duration-700 ${imgLoaded ? 'opacity-60' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)}
                    priority
                />
                {/* Fallback Grid se a imagem falhar */}
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
                )}
            </div>

            {/* CAMADA 2: CONTEÚDO */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full p-4 space-y-6">

                {/* Ícone ou Logo Mock */}
                <div className="p-4 rounded-full border border-green-500/30 bg-green-900/20 backdrop-blur-md animate-pulse">
                    <BeakerIcon className="w-16 h-16 text-green-400" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 uppercase">
                        Bio Research
                    </h1>
                    <p className="text-sm md:text-base text-green-200/50 tracking-[0.3em] uppercase">
                        Acesso Restrito · Nível 4
                    </p>
                </div>

                {/* Botão de Voltar (Essencial para não ficar preso) */}
                <Link
                    href="/workstation"
                    className="mt-8 px-8 py-3 rounded-full border border-white/10 hover:border-green-500/50 bg-black/40 hover:bg-green-900/20 backdrop-blur-md transition-all flex items-center gap-2 group"
                >
                    <ArrowLeftIcon className="w-4 h-4 text-white/60 group-hover:text-green-400 transition-colors" />
                    <span className="text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-widest">Retornar</span>
                </Link>
            </div>

            {/* Overlay de Scanlines (Estética Tech) */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] background-size-[100%_2px,3px_100%] pointer-events-none" />
        </div>
    );
}