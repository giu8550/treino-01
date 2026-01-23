"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { ArrowLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import MacSplash from "@/components/ui/MacSplash";

// --- LÓGICA DE SCRAMBLE ---
const CHAR_POOL = ["紀", "律", "知", "識", "未", "来", "革", "新", "卓", "越", "智", "慧", "教", "育"];
const useScrambleText = (targetText: string, start: boolean) => {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const stateRef = useRef<'idle' | 'scrambling' | 'resolving' | 'holding'>('idle');
    const startTimeRef = useRef<number>(0);
    const lastStateChangeTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number>();

    const animate = useCallback((timestamp: number) => {
        if (!start) return;
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        if (lastStateChangeTimeRef.current === 0) lastStateChangeTimeRef.current = timestamp;
        const elapsedInCurrentState = timestamp - lastStateChangeTimeRef.current;

        switch (stateRef.current) {
            case 'idle': stateRef.current = 'scrambling'; lastStateChangeTimeRef.current = timestamp; break;
            case 'scrambling':
                if (elapsedInCurrentState >= 3000) { stateRef.current = 'resolving'; lastStateChangeTimeRef.current = timestamp; }
                else { setDisplayText(targetText.split("").map(c => c === " " ? " " : CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]).join("")); }
                break;
            case 'resolving':
                const progress = Math.min(elapsedInCurrentState / 2000, 1);
                const resolved = targetText.split("").map((char, i) => i < targetText.length * progress ? char : (char === " " ? " " : CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)])).join("");
                setDisplayText(resolved);
                if (progress === 1) { stateRef.current = 'holding'; lastStateChangeTimeRef.current = timestamp; setIsComplete(true); }
                break;
            case 'holding':
                if (elapsedInCurrentState >= 3000) { stateRef.current = 'scrambling'; lastStateChangeTimeRef.current = timestamp; setIsComplete(false); }
                break;
        }
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [targetText, start]);

    useEffect(() => {
        if (start) animationFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameRef.current!);
    }, [animate, start]);

    return { displayText, isComplete };
};

// --- COMPONENTES AUXILIARES ---
const CyberTitle = ({ mainText, secondaryText, scrollText, startAnimations }: any) => {
    const { displayText: sText, isComplete: sDone } = useScrambleText(secondaryText, startAnimations);
    const { displayText: mText, isComplete: mDone } = useScrambleText(mainText, startAnimations);

    return (
        <div className="text-center mb-16 relative z-20 min-h-[200px] flex flex-col justify-center">
            <h2 className="text-lg md:text-2xl font-medium tracking-[0.3em] mb-3 font-mono uppercase h-8">
                <span className={`${sDone ? "text-cyan-400/90" : "text-white/40"} transition-all duration-1000`}>{sText}</span>
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white font-mono uppercase h-24">
                <span className={`${mDone ? "text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]" : "text-white/20"}`}>{mText}</span>
            </h1>
            <div className="mt-10 flex flex-col items-center gap-3">
                <span className="text-cyan-400 font-bold text-[10px] uppercase tracking-[0.5em] animate-pulse">{scrollText}</span>
                <ChevronDownIcon className="w-5 h-5 text-cyan-500/70" />
            </div>
        </div>
    );
};

const TextBlock = ({ children, align = "left", glowColor = "cyan", direction = "none", customBg = "bg-black/60" }: { children: React.ReactNode; align?: "left" | "right" | "center"; glowColor?: "cyan" | "purple", direction?: "left" | "right" | "none", customBg?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-15% 0px" });
    const alignClass = align === "left" ? "items-start text-left" : align === "right" ? "items-end text-right ml-auto" : "items-center text-center mx-auto";
    
    const xInitial = direction === "left" ? -150 : direction === "right" ? 150 : 0;
    const yInitial = direction === "none" ? 50 : 0;

    return (
        <motion.div 
            ref={ref} 
            initial={{ opacity: 0, x: xInitial, y: yInitial }} 
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: xInitial, y: yInitial }}
            transition={{ type: "spring", stiffness: 50, damping: 20, mass: 1 }}
            whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.3 } }}
            className={`flex flex-col ${alignClass} max-w-4xl w-full p-10 rounded-[2.5rem] 
                        backdrop-blur-xl ${customBg} border border-white/10 shadow-2xl 
                        relative overflow-hidden group 
                        ${glowColor === "cyan" ? "hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]" : "hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]"}`}
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-black/20" />
            <div className="relative z-10 space-y-6 text-white leading-relaxed font-light text-lg md:text-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {children}
            </div>
        </motion.div>
    );
};

// --- CUBO 3D INTERATIVO COM ROTAÇÃO CONTÍNUA ---
// --- CUBO 3D INTERATIVO (GIRAR SOBRE O EIXO) ---
const InteractiveCube = () => {
    const [isDragging, setIsDragging] = useState(false);
    
    // MotionValues para capturar o movimento do mouse/arrasto
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);
    
    // Mapeamos o movimento do arrasto diretamente para graus de rotação
    // Invertemos o Y para que o movimento seja intuitivo (puxar pra cima gira pra cima)
    const rotateX = useSpring(useTransform(dragY, [-200, 200], [180, -180]), { stiffness: 60, damping: 20 });
    const rotateY = useSpring(useTransform(dragX, [-200, 200], [-180, 180]), { stiffness: 60, damping: 20 });

    return (
        <div className="w-full h-full flex items-center justify-center perspective-1000 py-10 cursor-grab active:cursor-grabbing">
            <motion.div
                drag
                // dragConstraints garante que ele não saia do lugar físico, apenas capture o movimento
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0}
                style={{ 
                    rotateX: rotateX, 
                    rotateY: rotateY,
                    x: 0, // Forçamos a posição X e Y em zero para não "sair do canto"
                    y: 0 
                }}
                // Passamos os MotionValues do drag para os nossos calculadores de rotação
                onDrag={(e, info) => {
                    dragX.set(dragX.get() + info.delta.x);
                    dragY.set(dragY.get() + info.delta.y);
                }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                animate={!isDragging ? {
                    rotateY: [null, dragX.get() + 360],
                    rotateX: [null, dragY.get() + 360],
                } : {}}
                transition={!isDragging ? {
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                } : { duration: 0 }}
                className="relative w-40 h-40 preserve-3d"
            >
                {[
                    { text: "Monetize", color: "border-cyan-500/50 bg-cyan-950/60", trans: "translateZ(80px)" },
                    { text: "Research", color: "border-purple-500/50 bg-purple-950/60", trans: "rotateY(180deg) translateZ(80px)" },
                    { text: "AI Agents", color: "border-blue-500/50 bg-blue-950/60", trans: "rotateY(90deg) translateZ(80px)" },
                    { text: "IP Equity", color: "border-emerald-500/50 bg-emerald-950/60", trans: "rotateY(-90deg) translateZ(80px)" },
                    { text: "Real Yield", color: "border-yellow-500/50 bg-yellow-950/60", trans: "rotateX(90deg) translateZ(80px)" },
                    { text: "VERY Network", color: "border-red-500/50 bg-red-950/60", trans: "rotateX(-90deg) translateZ(80px)" }
                ].map((face, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 border-2 ${face.color} backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_30px_rgba(255,255,255,0.1)] rounded-lg`}
                        style={{ transform: face.trans, backfaceVisibility: "visible" }}
                    >
                        <span className="text-[11px] font-black uppercase text-white tracking-widest text-center px-2 drop-shadow-xl select-none">
                            {face.text}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- ARQUITETURA COM CUBO ---
const ArchitectureSection = ({ t }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-20% 0px" });
    return (
        <div ref={ref} className="flex flex-col items-center w-full max-w-[1400px] mx-auto my-32 relative">
            <div className="relative w-full min-h-[500px] flex items-center justify-center px-4 lg:px-0">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }} 
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }} 
                    transition={{ duration: 0.8 }} 
                    className="relative w-full lg:w-[65%] h-[400px] md:h-[500px] z-10 rounded-[3rem] overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                >
                    <Image src="/about/cyber-architecture.png" alt="VERY RWA Architecture" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 50 }} 
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }} 
                    transition={{ duration: 0.8, delay: 0.3 }} 
                    className="absolute right-4 lg:right-[5%] top-[5%] bottom-[5%] w-[90%] lg:w-[380px] z-20 flex flex-col justify-center"
                >
                    {/* CARD 3: PRETO TRANSPARENTE BEM ESCURO */}
                    <div className="relative h-full backdrop-blur-2xl bg-black/95 border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-8 flex flex-col justify-center items-center overflow-hidden">
                        <div className="relative z-10 w-full flex flex-col items-center justify-center">
                            <InteractiveCube />
                            <div className="mt-6 text-center">
                                <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-3 rounded-full shadow-[0_0_10px_cyan]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Real People, managed by AI, generating Real Value</p>
                                <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 mt-2">Grab and rotate to explore</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default function AboutUsPage() {
    const { t, i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef(null);
    const missionRef = useRef(null);
    
    const { scrollYProgress } = useScroll({ target: containerRef });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
    
    const { scrollYProgress: missionProgress } = useScroll({ target: missionRef, offset: ["start end", "end start"] });
    const missionX = useTransform(missionProgress, [0, 0.15, 0.6, 0.8], [-300, 0, 0, -300]);
    const missionOpacity = useTransform(missionProgress, [0, 0.15, 0.6, 0.8], [0, 1, 1, 0]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !i18n.isInitialized) return <MacSplash minDurationMs={1500} />;

    return (
        <div ref={containerRef} className="relative min-h-[300vh] bg-[#030014] overflow-hidden font-sans z-[200]">
            <button onClick={() => window.history.back()} className="fixed top-28 left-10 z-[300] flex items-center gap-3 text-white/40 hover:text-cyan-400 group">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-xl bg-white/5 transition-all shadow-xl">
                    <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-0 group-hover:opacity-100 transition-all">{t('about.back')}</span>
            </button>

            <motion.div className="fixed inset-0 z-[190]" style={{ y: backgroundY }}>
                <Image src="/about/about-us-room.png" alt="Zaeon Facility" fill priority className="object-cover opacity-60" />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#030014] via-[#030014]/50 to-transparent" />
            </motion.div>

            <div className="relative z-[210] flex flex-col items-center pt-[32vh] pb-[40vh] px-6 gap-[22vh]">
                <CyberTitle startAnimations={true} secondaryText={t('about.title_secondary')} mainText={t('about.title_main')} scrollText={t('about.scroll_down')} />

                {/* CARD 1: PRETO TRANSPARENTE */}
                <TextBlock align="left" glowColor="cyan" direction="none" customBg="bg-black/80">
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-6 tracking-tight uppercase flex items-center gap-4">
                        <span className="w-2 h-10 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"></span>
                        {t('about.genesis.title')}
                    </h2>
                    <p className="font-medium text-white/95">{t('about.genesis.p1')}</p>
                    <p className="text-white/80">{t('about.genesis.p2')} <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">{t('about.genesis.p2_highlight')}</span></p>
                </TextBlock>

                {/* CARD 2: ROXO ESCURO TRANSPARENTE */}
                <div ref={missionRef} className="w-full max-w-7xl flex items-center justify-end gap-16 relative">
                    <motion.div 
                        style={{ x: missionX, opacity: missionOpacity }} 
                        className="hidden lg:block relative w-[460px] h-[560px] rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.4)] transition-all duration-700"
                    >
                        <Image src="/assets/zenitta.png" alt="Zaeon Mission Visualization" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-transparent mix-blend-overlay" />
                    </motion.div>
                    
                    <TextBlock align="right" glowColor="purple" direction="right" customBg="bg-indigo-950/80">
                        <h2 className="text-2xl md:text-4xl font-black text-white mb-6 tracking-tight uppercase flex items-center justify-end gap-4">
                            {t('about.mission.title')}
                            <span className="w-2 h-10 bg-gradient-to-b from-purple-400 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]"></span>
                        </h2>
                        <p className="text-xl md:text-3xl font-extralight italic text-white drop-shadow-md">{t('about.mission.p1')}</p>
                        <p className="text-base text-white/70 mt-4 leading-relaxed">{t('about.mission.p2')}</p>
                    </TextBlock>
                </div>

                <ArchitectureSection t={t} />

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5 }} className="text-center relative z-40 pb-[10vh]">
                    <h2 className="text-4xl md:text-7xl font-black text-white mb-12 tracking-tighter drop-shadow-2xl opacity-90">{t('about.cta.tour_title')}</h2>
                    <button onClick={() => window.location.assign('/about/about-us')}
                            className="group relative px-20 py-8 bg-black/40 border border-cyan-500/30 text-white font-black text-xl uppercase tracking-[0.3em] overflow-hidden hover:scale-105 transition-all duration-500 rounded-2xl shadow-2xl backdrop-blur-md">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                        <span className="relative z-10 group-hover:text-cyan-100 group-hover:drop-shadow-[0_0_10px_white] transition-all">{t('about.cta.button_go')}</span>
                    </button>
                </motion.div>
            </div>
            
            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
            `}</style>
        </div>
    );
}