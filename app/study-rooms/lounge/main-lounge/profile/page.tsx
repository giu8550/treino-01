"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, BookOpen, ChevronUp, ChevronDown, Mars, Venus, Upload, 
    Fingerprint, Activity, ShieldCheck, Plus, X, Trophy, Flame, 
    Zap, CalendarDays, Star, BarChart3, Target
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// --- COMPONENTES VISUAIS ---

const StringLine = ({ height }: { height: number }) => (
    <div className="absolute left-1/2 -translate-x-1/2 w-[1px] bg-slate-400/30 dark:bg-white/10 z-0 pointer-events-none"
        style={{ height: `${height}px`, top: `-${height}px` }} />
);

// 1. GRÁFICO FULL-WIDTH (Topo - Limpo)
const FullWidthChart = () => (
    <div className="relative w-full h-32 overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-slate-100/40 to-white/40 dark:from-white/[0.03] dark:to-white/[0.01] border border-white/20 dark:border-white/10 shadow-lg backdrop-blur-md group">
        {/* Background Grid */}
        <div className="absolute inset-0 flex justify-between px-8 pointer-events-none opacity-10">
            {[...Array(12)].map((_, i) => <div key={i} className="h-full w-[1px] bg-slate-500 dark:bg-white border-r border-dashed" />)}
        </div>
        
        {/* Info */}
        <div className="absolute top-4 left-6 z-10">
            <span className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400 mb-1 block">Neural Sync</span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-500 dark:from-white dark:to-slate-400 tracking-tighter">
                94.2%
            </span>
        </div>

        {/* Curva SVG */}
        <div className="absolute bottom-0 left-0 right-0 h-3/4 opacity-70 group-hover:opacity-100 transition-opacity duration-700">
            <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                <path d="M0,40 C15,35 25,10 35,20 C45,30 55,5 65,15 C75,25 85,10 100,20 V40 H0 Z" fill="url(#chartGradient)" />
                <path d="M0,40 C15,35 25,10 35,20 C45,30 55,5 65,15 C75,25 85,10 100,20" fill="none" stroke="url(#chartGradient)" strokeWidth="0.5" className="drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            </svg>
        </div>
    </div>
);

// 2. MATRIZ DE HÁBITOS (Layout Tabela Compacta)
const HabitMatrix = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const [habits, setHabits] = useState([
        { id: 1, name: "Deep Work Protocol", days: [true, true, false, true, true, false, false] },
        { id: 2, name: "Neural Hydration", days: [true, true, true, true, true, true, true] },
        { id: 3, name: "Sys Maintenance", days: [false, false, true, false, true, false, false] },
    ]);
    const [newHabitName, setNewHabitName] = useState("");

    const toggleDay = (habitId: number, dayIndex: number) => {
        setHabits(habits.map(h => h.id === habitId ? { ...h, days: h.days.map((d, i) => i === dayIndex ? !d : d) } : h));
    };

    const addHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;
        setHabits([...habits, { id: Date.now(), name: newHabitName, days: Array(7).fill(false) }]);
        setNewHabitName("");
    };

    const deleteHabit = (id: number) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    // Configuração de Largura: Nome (w-40) + Gap (4) + Grid
    return (
        <div className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-2xl border border-white/30 dark:border-white/5 rounded-[1.5rem] p-6 shadow-xl flex flex-col gap-3">
            
            {/* Header da Matriz */}
            <div className="flex items-center gap-4 pb-2 border-b border-white/10">
                {/* Lado Esquerdo: Título (Alinhado com a coluna de nomes) */}
                <div className="w-40 flex items-center justify-end gap-2 text-amber-500 shrink-0">
                    <Trophy size={14} className="fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Objectives</span>
                </div>
                
                {/* Lado Direito: Dias (Alinhado com os checkboxes) */}
                <div className="flex gap-2">
                    {days.map((day, i) => (
                        <div key={i} className="w-6 text-center text-[8px] font-mono font-bold text-slate-400/60 dark:text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>
            </div>

            {/* Linhas da Matriz */}
            <div className="flex flex-col gap-2">
                <AnimatePresence>
                    {habits.map((habit) => (
                        <motion.div 
                            key={habit.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-4 group"
                        >
                            {/* Nome (Alinhado à direita para colar no grid) */}
                            <div className="w-40 flex items-center justify-end gap-2 shrink-0">
                                <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><X size={10} /></button>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate tracking-tight">{habit.name}</span>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-2">
                                {habit.days.map((completed, dayIndex) => (
                                    <motion.button
                                        key={dayIndex}
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => toggleDay(habit.id, dayIndex)}
                                        className={`
                                            w-6 h-6 rounded-[6px] flex items-center justify-center transition-all duration-300 border
                                            ${completed 
                                                ? 'bg-amber-500 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                                                : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-white/10'
                                            }
                                        `}
                                    >
                                        {completed && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input Rápido */}
            <form onSubmit={addHabit} className="flex justify-end mt-2 pt-2 border-t border-dashed border-slate-300 dark:border-white/5">
                <div className="relative w-full max-w-[300px]"> {/* Limita largura para alinhar melhor */}
                    <input 
                        type="text" 
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="+ New Protocol"
                        className="w-full bg-transparent text-[10px] font-bold text-center text-slate-500 placeholder:text-slate-400/50 focus:outline-none transition-all hover:text-white"
                    />
                </div>
            </form>
        </div>
    );
};

// 3. STATS ROW (Baixo - Cards Pequenos)
const StatsRow = () => (
    <div className="grid grid-cols-2 gap-4 w-full">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="flex flex-col z-10">
                <span className="text-[9px] uppercase tracking-widest text-amber-500/80 font-bold mb-1">Streak</span>
                <span className="text-2xl font-black text-amber-500 leading-none flex items-baseline gap-1">12 <span className="text-[9px] opacity-50">DAYS</span></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center z-10">
                <Flame size={20} className="text-amber-500 fill-amber-500/50 animate-pulse" />
            </div>
        </div>

        {/* Level Card */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-4 flex flex-col justify-center backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] uppercase tracking-widest text-indigo-400/80 font-bold">Level 04</span>
                <Star size={14} className="text-indigo-400 fill-indigo-400/30" />
            </div>
            <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
            </div>
            <span className="text-[8px] font-mono text-indigo-300/60 mt-1 text-right">2450 XP</span>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL (PÁGINA) ---
function ProfileModule() {
    const { data: session } = useSession();

    // Estados do Perfil (Original)
    const [name, setName] = useState(session?.user?.name || "Operative");
    const [age, setAge] = useState(27);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [studyArea, setStudyArea] = useState((session?.user as any)?.course || "Computer Science");

    // Dados visuais
    const role = (session?.user as any)?.role || "ARCHITECT";
    const torsoImage = (session?.user as any)?.torsoImage || "/assets/computer.png";
    const profileImage = session?.user?.image || null;

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar p-1 pb-24">
            
            {/* 1. SEÇÃO DE OBJETIVOS (Dashboard Unificado) */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col gap-4"
            >
                <FullWidthChart />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Matriz Principal (Ocupa 2/3 em telas grandes) */}
                    <div className="lg:col-span-2">
                        <HabitMatrix />
                    </div>
                    {/* Stats na Lateral ou Embaixo (Ocupa 1/3) */}
                    <div className="flex flex-col gap-4 justify-start">
                        <StatsRow />
                        {/* Espaço extra ou card decorativo se quiser */}
                        <div className="hidden lg:flex flex-1 bg-white/5 border border-white/10 rounded-2xl items-center justify-center p-4">
                            <Target size={32} className="text-white/20" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. SEÇÃO DE IDENTIDADE (Mantida Abaixo) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full flex flex-col md:flex-row overflow-hidden rounded-[2rem] shadow-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-3xl min-h-[450px]"
            >
                {/* Coluna Esquerda: Dados */}
                <div className="flex-1 relative p-8 flex flex-col items-center pt-10">
                    <div className="absolute top-4 left-6 opacity-5 dark:opacity-10 text-5xl font-black uppercase tracking-tighter -rotate-6 pointer-events-none select-none text-slate-900 dark:text-white z-0">
                        {role}
                    </div>

                    <div className="w-full max-w-sm flex flex-col gap-6 mt-4 z-10">
                        {/* Card ID */}
                        <div className="relative w-full bg-white/60 dark:bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-lg">
                            <StringLine height={60} />
                            <div className="flex items-center justify-between mb-4 border-b border-dashed border-slate-300/50 dark:border-white/10 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-black">Identity</span>
                                </div>
                                <Fingerprint size={14} className="text-slate-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-100/50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 px-3 py-2 flex items-center gap-2">
                                    <User size={14} className="text-cyan-500" />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border-none text-xs font-bold focus:outline-none text-slate-800 dark:text-white" />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 flex items-center justify-between bg-slate-100/50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 p-1 h-10">
                                        <button onClick={() => setAge(a => a - 1)} className="w-6 h-full flex items-center justify-center text-slate-500 hover:bg-white/10 rounded"><ChevronDown size={12} /></button>
                                        <span className="font-mono text-sm font-black text-cyan-600 dark:text-cyan-400">{age}</span>
                                        <button onClick={() => setAge(a => a + 1)} className="w-6 h-full flex items-center justify-center text-slate-500 hover:bg-white/10 rounded"><ChevronUp size={12} /></button>
                                    </div>
                                    <div className="flex-1 relative flex h-10 bg-slate-100/50 dark:bg-black/30 rounded-xl p-1 border border-slate-200 dark:border-white/5 cursor-pointer">
                                        <motion.div initial={false} animate={{ x: gender === 'male' ? 0 : '100%' }} className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-slate-700 shadow-sm" />
                                        <button onClick={() => setGender('male')} className="flex-1 z-10 flex items-center justify-center"><Mars size={14} className={gender === 'male' ? 'text-blue-500' : 'text-slate-400'} /></button>
                                        <button onClick={() => setGender('female')} className="flex-1 z-10 flex items-center justify-center"><Venus size={14} className={gender === 'female' ? 'text-pink-500' : 'text-slate-400'} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Knowledge */}
                        <div className="relative z-20 w-full bg-white/60 dark:bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl p-5 border border-white/50 dark:border-white/10 shadow-lg">
                            <StringLine height={30} />
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen size={14} className="text-purple-500" />
                                <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Knowledge</span>
                            </div>
                            <input type="text" value={studyArea} onChange={(e) => setStudyArea(e.target.value)} className="w-full bg-slate-100/50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none" />
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Avatar */}
                <div className="relative hidden md:block w-[40%] border-l border-white/30 dark:border-white/5 h-full bg-slate-200 dark:bg-[#0b121f] group cursor-pointer">
                    <Image src={torsoImage} alt="Torso" fill className="object-cover object-top transition-all duration-1000 group-hover:scale-105" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70" />
                    <motion.div className="absolute top-[20%] right-1/2 translate-x-1/2 z-30 w-32 h-32 rounded-full border-[3px] border-cyan-400/50 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl overflow-visible">
                        {profileImage ? <div className="w-full h-full rounded-full overflow-hidden relative"><Image src={profileImage} alt="Profile" fill className="object-cover" /></div> : <div className="flex flex-col items-center text-cyan-100"><User size={28} className="opacity-80 mb-1" /><span className="text-[7px] font-bold uppercase tracking-widest opacity-60">No Data</span></div>}
                        <div className="absolute -bottom-3 bg-cyan-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white/20 hover:scale-110 transition-transform"><Upload size={14} /></div>
                    </motion.div>
                    <div className="absolute bottom-8 left-6 right-6 text-white z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-[9px] text-cyan-300 font-mono mb-2 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                            {(studyArea || "UNASSIGNED").toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-black truncate tracking-tight">{name}</h2>
                        <p className="text-[10px] text-white/60 font-medium mt-1">Neural identity active.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default ProfileModule;