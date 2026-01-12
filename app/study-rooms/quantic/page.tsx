'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    LockClosedIcon,
    XCircleIcon,
    BeakerIcon,
    CalculatorIcon,
    VariableIcon,
    ChartBarIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

// --- DADOS DAS GAVETAS ---
const GADGETS_LIST = [
    {
        id: "theoretical",
        title: "THEORETICAL_PHYSICS",
        icon: <VariableIcon className="w-5 h-5" />,
        items: [
            { label: "Equation Solver", icon: "∑" },
            { label: "Constants DB", icon: "π" }
        ]
    },
    {
        id: "applied",
        title: "APPLIED_PHYSICS",
        icon: <BeakerIcon className="w-5 h-5" />,
        items: [
            { label: "Experiment Log", icon: "⚗️" },
            { label: "Particle Sim", icon: "⚛️" }
        ]
    },
    {
        id: "math",
        title: "PURE_MATHEMATICS",
        icon: <CalculatorIcon className="w-5 h-5" />,
        items: [
            { label: "Calculus Engine", icon: "∫" },
            { label: "Tensor Flow", icon: "T" }
        ]
    },
    {
        id: "quantum",
        title: "QUANTUM_DATA",
        icon: <ChartBarIcon className="w-5 h-5" />,
        items: [
            { label: "Wave Function", icon: "Ψ" },
            { label: "Entropy Graph", icon: "S" }
        ]
    }
];

// --- COMPONENTE GADGET (CONTROLADO PELO PAI) ---
interface DrawerProps {
    data: any;
    isOpen: boolean;
    onToggle: () => void;
    onAction: () => void;
}

const OdradekDrawer = ({ data, isOpen, onToggle, onAction }: DrawerProps) => {

    // Variantes de Animação
    const tray1Variants = {
        closed: { x: 0, y: 0, opacity: 0, scale: 0.5, pointerEvents: "none" as const },
        open: {
            x: 80,
            y: -20,
            opacity: 1,
            scale: 1,
            pointerEvents: "auto" as const,
            transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.1 }
        }
    };

    const tray2Variants = {
        closed: { x: 0, y: 0, opacity: 0, scale: 0.5, pointerEvents: "none" as const },
        open: {
            x: 100,
            y: 50,
            opacity: 1,
            scale: 1,
            pointerEvents: "auto" as const,
            transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.2 }
        }
    };

    return (
        <div className="relative z-40 group/drawer">
            {/* Base do Gadget (Botão de Ativação) */}
            <motion.button
                onClick={onToggle}
                className={`relative w-14 h-14 flex items-center justify-center border-2 backdrop-blur-md rounded-xl transition-all z-50 shadow-lg 
                    /* LIGHT MODE COLORS */
                    bg-white/80 border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50
                    /* DARK MODE COLORS */
                    dark:bg-blue-950/80 dark:border-blue-500/50 dark:text-blue-400 dark:hover:bg-blue-900/80 dark:hover:border-cyan-400
                    dark:shadow-blue-900/20
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ zIndex: isOpen ? 60 : 50 }}
            >
                <div className={`absolute inset-0 bg-blue-500/10 animate-pulse rounded-xl ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`transition-transform duration-500 ${isOpen ? 'rotate-90 text-blue-600 dark:text-cyan-300' : ''}`}>
                    {data.icon}
                </div>

                {/* Indicador de Status */}
                <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 dark:bg-cyan-400 rounded-full shadow-[0_0_8px_cyan] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
            </motion.button>

            {/* Braço Mecânico 1 */}
            <motion.div
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                variants={tray1Variants}
                className={`absolute top-0 left-0 w-48 border p-3 rounded-lg backdrop-blur-xl origin-left z-40
                    /* LIGHT */
                    bg-white/90 border-blue-200 shadow-xl shadow-blue-900/5
                    /* DARK */
                    dark:bg-black/90 dark:border-blue-500/30 dark:shadow-[0_0_20px_rgba(0,0,0,0.8)]
                `}
            >
                <div className="absolute top-1/2 -left-8 w-8 h-[1px] bg-blue-300 dark:bg-cyan-500/50" />
                <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-500/20 pb-2 mb-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-blue-700 dark:text-cyan-500">{data.items[0].label}</span>
                    <span className="text-xs text-blue-900 dark:text-white">{data.items[0].icon}</span>
                </div>
                <div className="h-1 w-full bg-blue-100 dark:bg-blue-900/30 rounded overflow-hidden">
                    <motion.div className="h-full bg-blue-500 dark:bg-cyan-500/50" initial={{ width: 0 }} animate={{ width: isOpen ? '100%' : 0 }} transition={{ duration: 1, delay: 0.5 }} />
                </div>
            </motion.div>

            {/* Braço Mecânico 2 */}
            <motion.div
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                variants={tray2Variants}
                className={`absolute top-0 left-0 w-48 border p-3 rounded-lg backdrop-blur-xl origin-left z-50
                    /* LIGHT */
                    bg-white/90 border-blue-200 shadow-xl shadow-blue-900/5
                    /* DARK */
                    dark:bg-black/90 dark:border-blue-500/30 dark:shadow-[0_0_20px_rgba(0,0,0,0.8)]
                `}
            >
                <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-500/20 pb-2 mb-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-blue-700 dark:text-cyan-500">{data.items[1].label}</span>
                    <span className="text-xs text-blue-900 dark:text-white">{data.items[1].icon}</span>
                </div>
                <div className="flex gap-2">
                    {/* Botões de Ação */}
                    <button onClick={onAction} className="flex-1 bg-blue-50 hover:bg-red-50 border border-blue-200 hover:border-red-200 text-[8px] py-1 text-blue-600 hover:text-red-500 uppercase transition-colors dark:bg-blue-500/10 dark:hover:bg-red-500/20 dark:border-blue-500/30 dark:text-cyan-200 dark:hover:text-red-300">
                        Launch
                    </button>
                    <button onClick={onAction} className="flex-1 bg-blue-50 hover:bg-red-50 border border-blue-200 hover:border-red-200 text-[8px] py-1 text-blue-600 hover:text-red-500 uppercase transition-colors dark:bg-blue-500/10 dark:hover:bg-red-500/20 dark:border-blue-500/30 dark:text-cyan-200 dark:hover:text-red-300">
                        Analyze
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// --- BACKGROUND WAVE (APENAS INFERIOR) ---
const BottomWaveMesh = () => (
    <div className="absolute bottom-0 inset-x-0 h-48 overflow-hidden pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen opacity-40 dark:opacity-60">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" transform="scale(1, -1)">
            <g fill="none" strokeWidth="1">
                <path className="stroke-blue-400/50 dark:stroke-cyan-400/30" d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,229.3C1120,235,1280,213,1360,202.7L1440,192" />
                <path className="stroke-blue-600/30 dark:stroke-blue-500/30" d="M0,160L80,176C160,192,320,224,480,218.7C640,213,800,171,960,165.3C1120,160,1280,192,1360,208L1440,224" />
            </g>
            <defs>
                <linearGradient id="bottomMist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)"/>
                    <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bottomMist)" className="mix-blend-overlay" />
        </svg>
    </div>
);


// --- PÁGINA PRINCIPAL ---
export default function QuanticRoomPage() {
    const { t } = useTranslation();
    const [imgLoaded, setImgLoaded] = useState(false);

    // Estados do Modal & Interação
    const [isLoaded, setIsLoaded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isError, setIsError] = useState(false);

    // Estado para Controle das Gavetas (Acordeão)
    const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleDrawerToggle = (id: string) => {
        setActiveDrawer(prev => prev === id ? null : id);
    };

    const handleGadgetAction = () => {
        setIsError(true);
        setTimeout(() => setIsError(false), 800);
    };

    const handleAuth = () => {
        if (inputValue === "ZA-2026") {
            setIsError(false);
            console.log("Quantum Access Granted");
        } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 1000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAuth();
    };

    return (
        // CONTÊINER PRINCIPAL
        <div className="relative w-screen h-screen overflow-hidden font-mono transition-colors duration-500
            bg-slate-50 text-slate-900 selection:bg-blue-200
            dark:bg-black dark:text-white dark:selection:bg-cyan-500/30
        ">

            {/* BACKGROUND + ONDA INFERIOR */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Gradiente Base */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-blue-950 dark:via-slate-950 dark:to-black" />

                {/* Imagem de Fundo */}
                <Image
                    src="/assets/quantic-room.png"
                    alt="Quantum Lab"
                    fill
                    className={`object-cover object-center transition-opacity duration-1000 
                        mix-blend-multiply opacity-10 
                        dark:mix-blend-overlay dark:opacity-60
                        ${imgLoaded ? '' : 'opacity-0'}
                    `}
                    onLoad={() => setImgLoaded(true)}
                    priority
                />
                <BottomWaveMesh />
            </div>

            {/* VOLTAR - Corrigido para ir para raiz (/) */}
            <Link
                href="/"
                className={`fixed top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur transition-all group
                    bg-white/50 border-slate-200 hover:bg-white hover:border-blue-400
                    dark:bg-black/50 dark:border-blue-500/20 dark:hover:bg-blue-500/10 dark:hover:border-cyan-400/50
                `}
            >
                <ArrowLeftIcon className="w-4 h-4 text-blue-500 dark:text-cyan-500 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">Back</span>
            </Link>

            {/* BARRA LATERAL ESQUERDA */}
            <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6 hidden md:flex">
                <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-200 dark:via-blue-500/30 to-transparent" />
                {GADGETS_LIST.map((gadget) => (
                    <OdradekDrawer
                        key={gadget.id}
                        data={gadget}
                        isOpen={activeDrawer === gadget.id}
                        onToggle={() => handleDrawerToggle(gadget.id)}
                        onAction={handleGadgetAction}
                    />
                ))}
            </div>

            {/* CONTEÚDO CENTRAL (MODAL) */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">

                <AnimatePresence>
                    {isLoaded && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                x: isError ? [0, -10, 10, -10, 10, 0] : 0
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="relative z-30"
                        >
                            <div
                                ref={modalRef}
                                className={`w-[400px] transition-all duration-300 relative border-2 backdrop-blur-xl
                                    /* LIGHT BASE */
                                    bg-white/80
                                    /* DARK BASE */
                                    dark:bg-black/80
                                    ${isError
                                    ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] dark:shadow-[0_0_50px_rgba(239,68,68,0.6)]'
                                    : 'border-blue-200 dark:border-cyan-800 shadow-xl shadow-blue-900/10 dark:shadow-[0_0_50px_rgba(6,182,212,0.15)]'
                                }
                                `}
                            >
                                {/* Top Bar */}
                                <div className={`border-b p-2 flex items-center justify-between select-none transition-colors duration-300
                                    ${isError
                                    ? 'bg-red-50 border-red-200 dark:bg-red-900/40 dark:border-red-800/50'
                                    : 'bg-blue-50/50 border-blue-100 dark:bg-cyan-900/20 dark:border-cyan-800/50'
                                }`}>
                                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] 
                                        ${isError ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-cyan-400'}`}>
                                        <BoltIcon className="w-4 h-4" />
                                        <span>{isError ? "ACTION_DENIED" : "QUANTUM_GATEWAY_V9"}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className={`w-1.5 h-1.5 animate-pulse rounded-full ${isError ? 'bg-red-500' : 'bg-blue-400 dark:bg-cyan-400'}`}></div>
                                        <div className={`w-1.5 h-1.5 rounded-full opacity-50 ${isError ? 'bg-red-200 dark:bg-red-900' : 'bg-blue-200 dark:bg-cyan-900'}`}></div>
                                    </div>
                                </div>

                                {/* Corpo */}
                                <div className="p-8 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col gap-6">

                                        {/* Header */}
                                        <div className={`border-l-4 pl-4 py-2 transition-colors duration-300 
                                            ${isError ? 'border-red-500' : 'border-blue-500 dark:border-cyan-600'}`}>
                                            <h2 className={`text-xl font-bold tracking-widest flex items-center gap-3 
                                                ${isError ? 'text-red-600 dark:text-red-500' : 'text-slate-800 dark:text-white'}`}>
                                                {isError ? <XCircleIcon className="w-6 h-6" /> : <LockClosedIcon className={`w-6 h-6 ${isError ? '' : 'text-blue-500 dark:text-cyan-500'}`} />}
                                                {isError ? "LOGIN REQUIRED" : "RESTRICTED"}
                                            </h2>
                                            <p className={`text-[10px] mt-1 uppercase tracking-[0.3em] transition-colors 
                                                ${isError ? 'text-red-400' : 'text-blue-400 dark:text-cyan-500/70'}`}>
                                                {isError ? "AUTHENTICATION NEEDED FOR ACCESS" : "PHYSICS DEPARTMENT"}
                                            </p>
                                        </div>

                                        {/* Input */}
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <label className={`text-[9px] uppercase font-bold mb-2 block transition-colors 
                                                    ${isError ? 'text-red-500' : 'text-blue-400 dark:text-cyan-500/50'}`}>
                                                    ACCESS KEY
                                                </label>
                                                <div className={`flex items-center border transition-colors duration-300 
                                                    ${isError
                                                    ? 'border-red-300 bg-red-50 dark:border-red-500/60 dark:bg-red-900/10'
                                                    : 'border-blue-200 bg-blue-50/50 dark:border-cyan-500/40 dark:bg-cyan-900/10 focus-within:border-blue-400 dark:focus-within:border-cyan-400'
                                                }`}>
                                                    <span className={`pl-3 font-bold text-lg transition-colors ${isError ? 'text-red-500' : 'text-blue-500 dark:text-cyan-500'}`}>{'>'}</span>
                                                    <input
                                                        type="password"
                                                        value={inputValue}
                                                        onChange={(e) => { setInputValue(e.target.value); setIsError(false); }}
                                                        onKeyDown={handleKeyDown}
                                                        className={`w-full bg-transparent border-none px-3 py-3 text-lg focus:ring-0 font-mono tracking-[0.5em] 
                                                        ${isError
                                                            ? 'text-red-600 dark:text-red-400 placeholder:text-red-300 dark:placeholder:text-red-800'
                                                            : 'text-slate-900 dark:text-white placeholder:text-blue-200 dark:placeholder:text-cyan-900/50'}`}
                                                        placeholder="••••"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAuth}
                                                className={`w-full border font-bold py-4 text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 group duration-300 hover:scale-[1.02] active:scale-95
                                                ${isError
                                                    ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-800/40 dark:border-red-600 dark:text-red-300'
                                                    : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 dark:bg-cyan-950/40 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-900/60'
                                                }`}
                                            >
                                                {isError ? "ACCESS DENIED" : "AUTHENTICATE"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Rodapé */}
                                <div className={`border-t p-2 flex justify-between text-[8px] uppercase tracking-wider transition-colors duration-300
                                    ${isError
                                    ? 'bg-red-50 border-red-100 text-red-500 dark:bg-red-900/20 dark:border-red-900/40'
                                    : 'bg-white border-blue-100 text-blue-400 dark:bg-cyan-950/80 dark:border-cyan-900/40 dark:text-cyan-700'
                                }`}>
                                    <span>SECURE_CONNECTION_TLS1.3</span>
                                    <span>{isError ? "ERR_AUTH_FAIL" : "SYSTEM_READY"}</span>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}