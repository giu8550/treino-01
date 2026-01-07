'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export default function QuanticRoomPage() {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black font-mono text-white">

            {/* BACKGROUND MOCK */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-950 via-slate-950 to-black">
                <Image
                    src="/assets/quantic-room.png" // Imagem futura
                    alt="Quantum Lab"
                    fill
                    className={`object-cover object-center mix-blend-overlay transition-opacity duration-1000 ${imgLoaded ? 'opacity-80' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)}
                    priority
                />
                {/* Mock de partículas/estrelas caso sem imagem */}
                {!imgLoaded && (
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                )}
            </div>

            {/* CONTEÚDO */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">

                <div className="relative border-y border-blue-500/30 bg-blue-950/10 backdrop-blur-sm w-full py-16 flex flex-col items-center">
                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />

                    <CpuChipIcon className="w-12 h-12 text-blue-400 mb-6 relative z-10" />

                    <h1 className="text-4xl md:text-7xl font-thin tracking-[0.1em] text-blue-100 relative z-10">
                        QUANTUM
                    </h1>
                    <div className="h-px w-24 bg-blue-500/50 my-4 relative z-10" />
                    <p className="text-xs md:text-sm text-blue-300/60 uppercase tracking-[0.3em] relative z-10">
                        Laboratório de Física Avançada
                    </p>
                </div>

                <Link
                    href="/workstation"
                    className="absolute bottom-12 flex items-center gap-2 px-6 py-2 rounded border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-400/50 transition-all group"
                >
                    <ArrowLeftIcon className="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase font-bold text-blue-400">Voltar à Estação</span>
                </Link>
            </div>
        </div>
    );
}