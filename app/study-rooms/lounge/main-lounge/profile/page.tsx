"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, BookOpen, ChevronUp, ChevronDown,
    Mars, Venus, Upload, Fingerprint, Activity, ShieldCheck
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Elemento decorativo (Fio que segura os cards)
const StringLine = ({ height }: { height: number }) => (
    <div className="absolute left-1/2 -translate-x-1/2 w-[1px] bg-slate-400/40 dark:bg-white/20 z-0 pointer-events-none"
        style={{ height: `${height}px`, top: `-${height}px` }} />
);

// ProfileModule Component - User Identity Management
function ProfileModule() {
    const { data: session } = useSession();

    // --- ESTADOS (Preenchidos com dados da sessão ou defaults) ---
    // Em uma aplicação real, você pode adicionar um useEffect para salvar alterações no banco
    const [name, setName] = useState(session?.user?.name || "Operative");
    const [age, setAge] = useState(27);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [studyArea, setStudyArea] = useState((session?.user as any)?.course || "Computer Science");

    // Dados visuais
    const role = (session?.user as any)?.role || "ARCHITECT";
    // Tenta pegar a imagem do corpo do usuário, senão usa o placeholder
    const torsoImage = (session?.user as any)?.torsoImage || "/assets/computer.png";
    const profileImage = session?.user?.image || null;

    return (
        <div className="w-full h-full flex flex-col md:flex-row overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl">

            {/* --- COLUNA ESQUERDA: EDITOR DE DADOS --- */}
            <div className="flex-1 relative p-8 flex flex-col items-center pt-14 overflow-y-auto custom-scrollbar">

                {/* Background Typography (Role) */}
                <div className="absolute top-6 left-6 opacity-5 dark:opacity-10 text-6xl font-black uppercase tracking-tighter -rotate-12 pointer-events-none select-none text-slate-900 dark:text-white z-0">
                    {role}
                </div>

                <div className="w-full max-w-md flex flex-col gap-8 mt-4 z-10">

                    {/* CARD 1: IDENTITY PROTOCOL */}
                    <motion.div
                        drag
                        dragConstraints={{ left: -10, right: 10, top: -10, bottom: 10 }}
                        dragElastic={0.1}
                        className="relative w-full bg-white/70 dark:bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 dark:border-white/10 shadow-xl"
                    >
                        <StringLine height={70} />

                        {/* Header do Card */}
                        <div className="flex items-center justify-between mb-6 border-b border-dashed border-slate-300 dark:border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-black">Identity Protocol</span>
                            </div>
                            <Fingerprint size={16} className="text-slate-400 dark:text-slate-500" />
                        </div>

                        {/* Inputs */}
                        <div className="space-y-5">
                            {/* Nome */}
                            <div>
                                <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider ml-1 mb-1 block">Full Name</label>
                                <div className="flex items-center bg-slate-100/50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 transition-colors focus-within:border-cyan-500/50">
                                    <User size={16} className="text-cyan-600 dark:text-cyan-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-transparent border-none text-sm font-bold p-2 focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Linha Dupla: Idade e Gênero */}
                            <div className="flex gap-4">
                                {/* Age Cycle */}
                                <div className="flex-1">
                                    <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider ml-1 mb-1 block">Age Cycle</label>
                                    <div className="flex items-center justify-between bg-slate-100/50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10 p-1 h-12">
                                        <button onClick={() => setAge(a => Math.max(1, a - 1))} className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"><ChevronDown size={14} /></button>
                                        <span className="font-mono text-lg font-black text-cyan-600 dark:text-cyan-400">{age}</span>
                                        <button onClick={() => setAge(a => a + 1)} className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"><ChevronUp size={14} /></button>
                                    </div>
                                </div>

                                {/* Biometrics */}
                                <div className="flex-1">
                                    <label className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider ml-1 mb-1 block">Biometrics</label>
                                    <div className="relative flex h-12 bg-slate-100/50 dark:bg-black/30 rounded-xl p-1 border border-slate-200 dark:border-white/10 cursor-pointer">
                                        <motion.div
                                            initial={false}
                                            animate={{ x: gender === 'male' ? 0 : '100%' }}
                                            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-slate-700 shadow-sm"
                                        />
                                        <button onClick={() => setGender('male')} className="flex-1 z-10 flex items-center justify-center transition-colors">
                                            <Mars size={18} className={gender === 'male' ? 'text-blue-500' : 'text-slate-400'} />
                                        </button>
                                        <button onClick={() => setGender('female')} className="flex-1 z-10 flex items-center justify-center transition-colors">
                                            <Venus size={18} className={gender === 'female' ? 'text-pink-500' : 'text-slate-400'} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARD 2: KNOWLEDGE BASE */}
                    <motion.div
                        drag
                        dragConstraints={{ left: -10, right: 10 }}
                        dragElastic={0.1}
                        className="relative z-20 w-full bg-white/70 dark:bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 dark:border-white/10 shadow-xl"
                    >
                        <StringLine height={40} />
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={14} className="text-purple-500" />
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Knowledge Base</span>
                        </div>
                        <input
                            type="text"
                            value={studyArea}
                            onChange={(e) => setStudyArea(e.target.value)}
                            placeholder="Ex: Software Engineering"
                            className="w-full bg-slate-100/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-400"
                        />

                        <div className="flex gap-2 mt-4">
                            <div className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/20 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-purple-500" />
                                <span className="text-[9px] font-bold text-purple-600 dark:text-purple-300 uppercase">Clearance: Level 4</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-2">
                                <Activity size={12} className="text-slate-400" />
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-300 uppercase">Status: Active</span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* --- COLUNA DIREITA: VISUALIZAÇÃO DO AVATAR --- */}
            <div className="relative hidden md:block w-[40%] border-l border-white/40 dark:border-white/10 h-full overflow-hidden bg-slate-200 dark:bg-[#0b121f] group cursor-pointer">
                {/* Imagem do Torso/Corpo */}
                <Image
                    src={torsoImage}
                    alt="Torso"
                    fill
                    className="object-cover object-top transition-all duration-700 group-hover:scale-105"
                    priority
                />

                {/* Gradiente de Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                {/* FACE CIRCLE (Foto de Perfil Flutuante) */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-[18%] right-1/2 translate-x-1/2 z-30 w-36 h-36 rounded-full border-[3px] border-cyan-400/50 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl overflow-visible group/circle"
                >
                    {profileImage ? (
                        <div className="w-full h-full rounded-full overflow-hidden relative">
                            <Image src={profileImage} alt="Profile" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-cyan-100">
                            <User size={32} className="opacity-80 mb-1" />
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">No Face Data</span>
                        </div>
                    )}

                    {/* Botão de Upload (Decorativo ou Funcional) */}
                    <div className="absolute -bottom-4 bg-cyan-500 text-white p-2 rounded-full shadow-lg border-2 border-white/20 hover:scale-110 transition-transform cursor-pointer">
                        <Upload size={16} />
                    </div>
                </motion.div>

                {/* Rodapé da Imagem */}
                <div className="absolute bottom-10 left-8 right-8 text-white z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-[10px] text-cyan-300 font-mono mb-3 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                        SYSTEM: {(studyArea || "UNASSIGNED").toUpperCase()}_MODE
                    </div>
                    <h2 className="text-3xl font-black truncate tracking-tight">{name || 'Unknown Subject'}</h2>
                    <p className="text-[11px] text-white/60 leading-relaxed font-medium mt-2">
                        Neural identity established. Access level granted for study rooms and lounge areas.
                    </p>
                </div>
            </div>

        </div>
    );
}

// Explicit default export for Next.js App Router and dynamic imports
export default ProfileModule;