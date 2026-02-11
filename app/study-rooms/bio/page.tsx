"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
    Dna, Activity, CheckCircle, AlertTriangle, 
    BookOpen, ClipboardList, FlaskConical, Microscope, 
    Users, Eye, EyeOff, Minus, X 
} from 'lucide-react';
import { Navbar } from "@/components/main/navbar";
import { LoungeChatWidget } from "@/components/sub/LoungeChatWidget";

// --- 1. CONFIGURAÇÃO DE IMPORTS ---
const LoadingModule = () => (
    <div className="w-full h-full flex items-center justify-center text-emerald-400/50 animate-pulse text-xs tracking-widest uppercase">
        Loading Stream...
    </div>
);

// CORREÇÃO: Apontando para os módulos reais ('classes' e 'exames') em vez dos mockups ('lessons' e 'exams')
const LessonsModule = dynamic(() => import('./main-room/classes/page'), { loading: LoadingModule });
const ExamsModule = dynamic(() => import('./main-room/exams/page'), { loading: LoadingModule });
const ProjectsModule = dynamic(() => import('./main-room/projects/page'), { loading: LoadingModule });
const ResearchModule = dynamic(() => import('./main-room/researches/page'), { loading: LoadingModule });
const CommunityModule = dynamic(() => import('./main-room/community/page'), { loading: LoadingModule });

// --- 2. TERMOS ---
const BASE_TERMS = [
    "Mitochondria", "Ribosome", "Nucleus", "Cytoplasm", "Membrane",
    "DNA", "RNA", "CRISPR", "Enzyme", "Protein", "Lipid", "ATP", 
    "Neuron", "Axon", "Synapse", "Dendrite", "Myelin", "Hemoglobin", 
    "Leukocyte", "Platelet", "Plasma", "Antibody", "Antigen", "Virus"
];
const BIO_TERMS = [...BASE_TERMS, ...BASE_TERMS];

export default function ZaeonBiologyRoom() {
    // --- ESTADOS ---
    const [isLoaded, setIsLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const [activeTab, setActiveTab] = useState("lessons");
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    
    // REF para o Timer do Menu (Hover Intent)
    const sidebarTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [tabs, setTabs] = useState([
        { id: 'lessons', label: 'Classes', icon: <BookOpen size={18} /> },
        { id: 'exams', label: 'Exams', icon: <ClipboardList size={18} /> },
        { id: 'projects', label: 'Projects', icon: <FlaskConical size={18} /> },
        { id: 'research', label: 'Research', icon: <Microscope size={18} /> },
        { id: 'community', label: 'Community', icon: <Users size={18} /> },
    ]);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- HANDLERS DA SIDEBAR (Lógica de 3 Segundos) ---
    const handleSidebarEnter = () => {
        // Inicia o timer de 3 segundos
        sidebarTimerRef.current = setTimeout(() => {
            setIsSidebarExpanded(true);
        }, 2000);
    };

    const handleSidebarLeave = () => {
        // Se sair antes de 3s, cancela a abertura
        if (sidebarTimerRef.current) {
            clearTimeout(sidebarTimerRef.current);
            sidebarTimerRef.current = null;
        }
        // Fecha imediatamente ao sair
        setIsSidebarExpanded(false);
    };

    // --- SETUP & DETECÇÃO DE TEMA ---
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 500);

        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    // --- BIO-PHYSICS ENGINE (CANVAS) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000 };
        const interactionRadius = 300;

        const handleMouseMove = (event: MouseEvent) => { mouse.x = event.clientX; mouse.y = event.clientY; };
        const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        resize();

        const SPACING = 60; 
        const TOTAL_HEIGHT = BIO_TERMS.length * SPACING; 

        class Molecule {
            text: string; y: number; strand: 1 | 2; x: number = 0;
            scale: number = 1; opacity: number = 1; baseX: number = 0;
            constructor(text: string, startY: number, strand: 1 | 2) {
                this.text = text; this.y = startY; this.strand = strand;
            }
            update(canvasW: number, speed: number) {
                this.y -= speed;
                if (this.y < -100) this.y += TOTAL_HEIGHT;
                
                const helixRadius = 140;
                const helixCenter = canvasW * 0.85; 
                
                const frequency = 0.005; 
                const angle = (this.y * frequency) + (this.strand === 1 ? 0 : Math.PI);
                this.baseX = helixCenter + Math.cos(angle) * helixRadius;
                
                const dx = mouse.x - this.baseX;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let targetX = this.baseX;

                if (dist < interactionRadius && dist > 0) {
                    const pullStrength = Math.pow(1 - dist / interactionRadius, 2);
                    const offsetX = (dx / dist) * pullStrength * 60;
                    targetX = this.baseX + offsetX;
                }

                if (this.x === 0) this.x = this.baseX;
                this.x += (targetX - this.x) * 0.1;
            }

            draw(ctx: CanvasRenderingContext2D) {
                const colorStrand1 = isDarkMode ? '#34d399' : '#166534'; 
                const colorStrand2 = isDarkMode ? '#22d3ee' : '#0e7490'; 
                const textColor = isDarkMode ? '#ecfdf5' : '#0f172a';   

                let displayColor = this.strand === 1 ? colorStrand1 : colorStrand2;

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(this.scale, this.scale);
                ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fillStyle = displayColor; ctx.globalAlpha = 0.8; ctx.fill();
                
                if (isDarkMode) {
                    ctx.shadowBlur = 15; ctx.shadowColor = displayColor;
                }

                ctx.fillStyle = textColor; ctx.globalAlpha = 1;
                ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(this.text, 15, 0);
                ctx.restore();
            }
        }

        const molecules: Molecule[] = [];
        BIO_TERMS.forEach((term, i) => {
            const strand = i % 2 === 0 ? 1 : 2;
            const startY = canvas.height + (i * SPACING);
            molecules.push(new Molecule(term, startY, strand));
        });

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const lineColor1 = isDarkMode ? 'rgba(52, 211, 153, 0.3)' : 'rgba(22, 101, 52, 0.3)';
            const lineColor2 = isDarkMode ? 'rgba(34, 211, 238, 0.3)' : 'rgba(14, 116, 144, 0.3)';

            const drawStrand = (strandNum: 1 | 2) => {
                const strandMols = molecules.filter(m => m.strand === strandNum).sort((a, b) => a.y - b.y);
                ctx.beginPath();
                ctx.strokeStyle = strandNum === 1 ? lineColor1 : lineColor2;
                ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                if (strandMols.length > 0) {
                    let started = false;
                    for (let i = 0; i < strandMols.length - 1; i++) {
                        const curr = strandMols[i]; const next = strandMols[i+1];
                        if (Math.abs(curr.y - next.y) < SPACING * 2.5) {
                            if (!started) { ctx.moveTo(curr.x, curr.y); started = true; }
                            const midX = (curr.x + next.x) / 2; const midY = (curr.y + next.y) / 2;
                            ctx.quadraticCurveTo(curr.x, curr.y, midX, midY); ctx.quadraticCurveTo(midX, midY, next.x, next.y);
                        } else { started = false; }
                    }
                }
                ctx.stroke();
            };
            molecules.forEach(m => m.update(canvas.width, 1.2));
            drawStrand(1); drawStrand(2);
            molecules.sort((a, b) => a.scale - b.scale);
            molecules.forEach(m => m.draw(ctx));
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]);

    // --- ESTILOS FIXOS (TEMA VERDE SEMPRE) ---
    const fixedBioStyle = `
        bg-[#022c22]/80 
        backdrop-blur-[20px] 
        border border-emerald-500/30 
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
        text-emerald-50
    `;

    return (
        <div className={`relative w-screen h-screen overflow-hidden font-mono transition-colors duration-700
            ${isDarkMode ? 'bg-black' : 'bg-white'}
        `}>

            {/* 1. BACKGROUND: CANVAS DNA */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

            {/* 2. MODAL DE PROTOCOLO */}
            <AnimatePresence>
                {isLoaded && isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[440px] overflow-hidden relative shadow-2xl ${fixedBioStyle} rounded-2xl`}
                        >
                            <div className="border-b border-emerald-500/30 p-3 flex justify-between bg-emerald-900/40">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                    <Activity size={12} /> PROTOCOL_V2
                                </div>
                            </div>
                            
                            <div className="p-8 relative">
                                <div className="border-l-2 pl-4 mb-6 border-yellow-500">
                                    <h2 className="font-bold text-lg flex items-center gap-2 text-white">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" /> 
                                        Restricted Area
                                    </h2>
                                    <p className="text-[10px] uppercase tracking-widest mt-1 text-emerald-400/70">Bio-Medical Sciences Only</p>
                                </div>
                                <p className="text-sm leading-relaxed mb-8 text-emerald-100/80">
                                    You are entering the <strong>Biology & Health Lounge</strong>. 
                                    <br/>All systems are optimized for organic chemistry, anatomy, and medical research.
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full py-4 font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 group border
                                    bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500 hover:text-black text-emerald-400"
                                >
                                    <CheckCircle size={14} /> Initialize Access
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. NAVBAR REINTEGRADA */}
            <AnimatePresence>
                {!isFocusMode && !isModalOpen && (
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }} 
                        className="fixed top-0 left-0 w-full z-50 pointer-events-auto"
                    >
                        <Navbar />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. MAIN UI */}
            <AnimatePresence>
                {!isModalOpen && (
                    <motion.div 
                        layout 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } }}
                        className={`flex items-start justify-start px-4 gap-4 w-full h-full relative z-10 transition-all duration-700 ${isFocusMode ? 'pt-4' : 'pt-24'}`}
                    >
                        {/* SIDEBAR (Com Hover Delay) */}
                        <motion.aside
                            layout
                            className={`rounded-[2rem] ${fixedBioStyle} flex flex-col items-center py-6 gap-3 z-20 relative
                                ${isSidebarExpanded ? 'w-48 px-4' : 'w-14'}
                                ${isFocusMode ? 'h-[96vh]' : 'h-[80vh]'} 
                            `}
                            onMouseEnter={handleSidebarEnter}
                            onMouseLeave={handleSidebarLeave}
                        >
                            <Reorder.Group axis="y" values={tabs} onReorder={setTabs} className="flex flex-col gap-2 w-full flex-1 justify-center">
                                {tabs.map((item) => (
                                    <Reorder.Item key={item.id} value={item}>
                                        <button 
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setIsMinimized(false);
                                            }}
                                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all relative overflow-hidden group
                                            ${activeTab === item.id
                                                ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                                : 'text-emerald-500/40 hover:text-emerald-100 hover:bg-emerald-500/10'
                                            }`}
                                        >
                                            <div className="shrink-0 relative z-10">{item.icon}</div>
                                            {isSidebarExpanded && (
                                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black uppercase tracking-widest truncate relative z-10">
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </button>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>

                            <div className="w-full pt-4 mt-auto border-t border-emerald-500/20">
                                <button 
                                    onClick={() => setIsFocusMode(!isFocusMode)}
                                    className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all 
                                        ${isFocusMode 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : 'text-emerald-500/40 hover:text-emerald-100 hover:bg-emerald-500/10'
                                        }`}
                                >
                                    <div className="shrink-0">
                                        {isFocusMode ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                    {isSidebarExpanded && (
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black uppercase tracking-widest truncate">
                                            {isFocusMode ? "Exit" : "Focus"}
                                        </motion.span>
                                    )}
                                </button>
                            </div>
                        </motion.aside>

                        {/* CONTENT AREA */}
                        <AnimatePresence>
                            {!isMinimized && (
                                <motion.main 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                                    className={`flex-1 rounded-[2.5rem] ${fixedBioStyle} overflow-hidden flex flex-col relative transition-all duration-700
                                        ${isFocusMode ? 'h-[96vh]' : 'h-[88vh]'}
                                    `}
                                >
                                    <div className="p-8 pb-4 flex justify-between items-center border-b border-emerald-500/20">
                                        <h2 className="text-xl font-black uppercase tracking-[0.2em] leading-none flex items-center gap-3 text-emerald-100">
                                            <Dna className="w-6 h-6 text-emerald-500" />
                                            {tabs.find(t => t.id === activeTab)?.label}
                                        </h2>
                                        
                                        <button 
                                            onClick={() => setIsMinimized(true)}
                                            className="p-2 rounded-full hover:bg-emerald-500/20 text-emerald-400/50 hover:text-emerald-200 transition-colors"
                                            title="Minimize to Sidebar"
                                        >
                                            <Minus size={20} />
                                        </button>
                                    </div>

                                    {/* Container dos módulos: Força o tema 'dark' interno para que os módulos usem as cores verdes */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-6 relative text-emerald-50 dark">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="h-full"
                                            >
                                                {activeTab === 'lessons' && <LessonsModule />}
                                                {activeTab === 'exams' && <ExamsModule />}
                                                {activeTab === 'projects' && <ProjectsModule />}
                                                {activeTab === 'research' && <ResearchModule />}
                                                {activeTab === 'community' && <CommunityModule />}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </motion.main>
                            )}
                        </AnimatePresence>
                        
                        {/* Wrapper do Chat (Sempre Tema Bio, DEFAULT CLOSED) */}
                        <div className="relative z-50 text-emerald-50 dark">
                            <LoungeChatWidget />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}