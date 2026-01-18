"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpenIcon, UsersIcon, BeakerIcon, MagnifyingGlassIcon,
    UserPlusIcon, ChatBubbleLeftRightIcon,
    XMarkIcon, NewspaperIcon, GlobeAmericasIcon, SignalIcon
} from "@heroicons/react/24/outline";

// 1. IMPORTANDO A NAVBAR
import { Navbar } from "@/components/main/navbar";

// 2. IMPORTANDO O FEED (Ajuste o caminho se necessário)
import FeedBrasil from "./lounge-br/FeedBrasil";

// 3. DEFINIÇÃO DO GLOBO (Com correção de tipagem)
const LoungeEarth = dynamic(() => import("@/components/sub/LoungeEarth"), {
    ssr: false,
    loading: () => <div className="w-40 h-40 rounded-full border border-white/5 animate-pulse" />
}) as any; // Cast 'as any' para evitar erro de IntrinsicAttributes se o componente filho não tiver tipos exportados

const TOP_RESEARCHERS = [
    { id: 1, name: "Dr. Aristhos", xp: "12.4k", rank: "1" },
    { id: 2, name: "Elena Volkov", xp: "10.8k", rank: "2" },
    { id: 3, name: "Morfeu.eth", xp: "9.2k", rank: "3" },
];

export default function LoungePage() {
    const [activeTab, setActiveTab] = useState("community");
    const [userTab, setUserTab] = useState<"buddies" | "top">("buddies");
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    // Estados para Controle de Região e Feed
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [isFeedActive, setIsFeedActive] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    // Resetar o feed ao fechar a região
    useEffect(() => {
        if (!selectedRegion) setIsFeedActive(false);
    }, [selectedRegion]);

    // --- ESTILO LIQUID GLASS ---
    const cardStyle = `
        dark:bg-white/[0.05] 
        bg-white/60
        backdrop-blur-[45px] saturate-[1.3]
        border dark:border-white/10 border-white/80
        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]
    `;

    return (
        <div className="relative z-0 w-screen h-screen dark:bg-[#010816] bg-[#e2e8f0] transition-colors duration-1000 font-sans overflow-hidden flex flex-col">

            {/* NAVBAR */}
            <Navbar />

            <div className="flex items-start justify-center px-6 gap-6 pt-32 w-full h-full">

                {/* BACKGROUND */}
                <div className="absolute inset-0 z-[-1] pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[70%] dark:bg-blue-600/10 bg-blue-400/10 blur-[150px] rounded-full"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[60%] dark:bg-indigo-500/10 bg-slate-300/20 blur-[180px] rounded-full"></div>
                </div>

                {/* SIDEBAR */}
                <motion.aside
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                    className={`z-10 h-[70vh] rounded-[2.5rem] ${cardStyle} transition-all duration-500 flex flex-col items-center py-10 gap-10 ${isSidebarExpanded ? 'w-64 px-6' : 'w-20'}`}
                >
                    <div className="flex flex-col gap-6 w-full flex-1 justify-center">
                        <SidebarItem icon={<UsersIcon className="w-5 h-5" />} label="Comunidade" active={activeTab === 'community'} expanded={isSidebarExpanded} onClick={() => setActiveTab('community')} />
                        <SidebarItem icon={<BookOpenIcon className="w-5 h-5" />} label="Aulas" active={activeTab === 'lessons'} expanded={isSidebarExpanded} onClick={() => setActiveTab('lessons')} />
                        <SidebarItem icon={<BeakerIcon className="w-5 h-5" />} label="Projetos" active={activeTab === 'projects'} expanded={isSidebarExpanded} onClick={() => setActiveTab('projects')} />
                        <SidebarItem icon={<NewspaperIcon className="w-5 h-5" />} label="Notícias" active={activeTab === 'news'} expanded={isSidebarExpanded} onClick={() => setActiveTab('news')} />
                    </div>
                </motion.aside>

                {/* FEED CENTRAL / GLOBO */}
                <main className={`z-10 flex-1 h-[82vh] rounded-[3.5rem] ${cardStyle} overflow-hidden flex flex-col relative`}>
                    <div className="p-10 pb-4 flex justify-between items-center border-b dark:border-white/5 border-black/5">
                        <h2 className="text-xl font-black uppercase tracking-[0.3em] dark:text-white text-slate-900 leading-none">
                            {activeTab}
                        </h2>
                        {selectedRegion && (
                            <button onClick={() => setSelectedRegion(null)} className="flex items-center gap-2 px-4 py-1.5 dark:bg-white/10 bg-slate-800 rounded-full text-[9px] font-black text-white uppercase tracking-widest hover:scale-105 transition-all">
                                <XMarkIcon className="w-4 h-4" /> Reset Orbit
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center relative p-12 pt-6">
                        <div className="w-full flex flex-col items-center pb-24">

                            {/* O Globo encolhe se o feed estiver ativo para dar espaço */}
                            <motion.div
                                animate={{ scale: isFeedActive ? 0.8 : 1, opacity: isFeedActive ? 0.6 : 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-[380px] h-[380px] shrink-0 relative z-10 my-4"
                            >
                                <LoungeEarth onSelectRegion={(region: string) => setSelectedRegion(region)} />
                            </motion.div>

                            {!isFeedActive && (
                                <p className="text-[10px] uppercase tracking-[0.8em] dark:text-white/20 text-slate-400 font-bold mb-12">
                                    ZAEON GLOBAL NETWORK
                                </p>
                            )}

                            <AnimatePresence mode="wait">
                                {selectedRegion === 'br' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="w-full max-w-xl p-8 dark:bg-white/[0.03] bg-white border dark:border-white/5 border-gray-200 rounded-[2.5rem] shadow-sm relative overflow-hidden"
                                    >
                                        {!isFeedActive ? (
                                            // ESTADO 1: CARTÃO DE ENTRADA (GATEWAY)
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <div className="w-12 h-12 rounded-full dark:bg-blue-500/20 bg-blue-100 flex items-center justify-center mb-2">
                                                    <GlobeAmericasIcon className="w-6 h-6 dark:text-blue-400 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold dark:text-white text-slate-900">Cluster Brasil</h3>
                                                    <p className="text-xs dark:text-slate-400 text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                                                        Conexão segura detectada no Ceará. Acesso disponível para troca de dados acadêmicos.
                                                    </p>
                                                </div>

                                                {/* BOTÃO QUE VOCÊ PEDIU */}
                                                <button
                                                    onClick={() => setIsFeedActive(true)}
                                                    className="mt-4 group relative px-8 py-3 bg-slate-900 dark:bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                                >
                                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest dark:text-black text-white">
                                                        <SignalIcon className="w-3 h-3 animate-pulse" />
                                                        Comunidade Zaeon [ Brasil ]
                                                    </span>
                                                </button>
                                            </div>
                                        ) : (
                                            // ESTADO 2: O FEED REAL
                                            <div className="w-full">
                                                <div className="flex items-center gap-3 mb-6 pb-4 border-b dark:border-white/5 border-black/5">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                    <h3 className="text-xs font-black uppercase tracking-widest dark:text-white/50 text-slate-400">Transmissão em Tempo Real</h3>
                                                </div>
                                                {/* INSERINDO O COMPONENTE NOVO */}
                                                <FeedBrasil />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>

                {/* PAINEL DIREITO */}
                <aside className={`z-10 w-85 h-[70vh] rounded-[2.5rem] ${cardStyle} p-8 flex flex-col gap-8 mt-12`}>
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-4 h-4 dark:text-white/20 text-slate-400" />
                        <input type="text" placeholder="Search..." className="w-full dark:bg-black/40 bg-white border dark:border-white/10 border-gray-300 rounded-2xl py-3 pl-12 pr-4 text-xs outline-none dark:text-white text-slate-900 placeholder:text-slate-400" />
                    </div>

                    <div className="flex dark:bg-black/30 bg-slate-200 p-1 rounded-2xl border dark:border-white/5 border-black/5 shrink-0">
                        <button onClick={() => setUserTab('buddies')} className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${userTab === 'buddies' ? 'dark:bg-white/10 bg-slate-800 text-white shadow-lg' : 'dark:text-white/30 text-slate-500'}`}>Buddies</button>
                        <button onClick={() => setUserTab('top')} className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${userTab === 'top' ? 'dark:bg-white/10 bg-slate-800 text-white shadow-lg' : 'dark:text-white/30 text-slate-500'}`}>Top Rated</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <AnimatePresence mode="wait">
                            {userTab === 'top' ? (
                                <motion.div key="top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    {TOP_RESEARCHERS.map((user, idx) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 rounded-3xl dark:bg-white/[0.03] bg-white border dark:border-transparent border-gray-100 hover:dark:bg-white/10 hover:shadow-md transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border ${idx === 0 ? 'bg-white text-black' : 'dark:bg-white/10 bg-slate-100 dark:text-white text-slate-500'}`}>#{user.rank}</div>
                                                <span className="text-xs font-bold dark:text-white text-slate-900">{user.name}</span>
                                            </div>
                                            <UserPlusIcon className="w-4 h-4 dark:text-white text-slate-300" />
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <ChatBubbleLeftRightIcon className="w-10 h-10 dark:text-white text-slate-900" />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(150,150,150,0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}

function SidebarItem({ icon, label, active, expanded, onClick }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-5 w-full p-4 rounded-2xl transition-all 
            ${active
            ? 'dark:bg-white/10 bg-slate-800 text-white shadow-lg border dark:border-white/10 border-transparent'
            : 'dark:text-white/40 text-slate-500 hover:dark:text-white hover:text-slate-900'}`}>
            <div className="shrink-0">{icon}</div>
            {expanded && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black uppercase tracking-widest truncate">{label}</motion.span>}
        </button>
    );
}