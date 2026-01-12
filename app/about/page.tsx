"use client";

// CORREÇÃO 1: Importamos 'forwardRef' diretamente, sem importar o 'React' default.
import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import MacSplash from "@/components/ui/MacSplash";

// --- LÓGICA DE SCRAMBLE (Mantida) ---
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
            case 'idle':
                stateRef.current = 'scrambling';
                lastStateChangeTimeRef.current = timestamp;
                break;
            case 'scrambling':
                if (elapsedInCurrentState >= 3000) {
                    stateRef.current = 'resolving';
                    lastStateChangeTimeRef.current = timestamp;
                } else {
                    setDisplayText(targetText.split("").map(c => c === " " ? " " : CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]).join(""));
                }
                break;
            case 'resolving':
                const progress = Math.min(elapsedInCurrentState / 2000, 1);
                const resolved = targetText.split("").map((char, i) => i < targetText.length * progress ? char : (char === " " ? " " : CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)])).join("");
                setDisplayText(resolved);
                if (progress === 1) {
                    stateRef.current = 'holding';
                    lastStateChangeTimeRef.current = timestamp;
                    setIsComplete(true);
                }
                break;
            case 'holding':
                if (elapsedInCurrentState >= 3000) {
                    stateRef.current = 'scrambling';
                    lastStateChangeTimeRef.current = timestamp;
                    setIsComplete(false);
                }
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

// --- COMPONENTES AUXILIARES DE TEXTO ---
const CyberTitle = ({ mainText, secondaryText, scrollText, startAnimations }: any) => {
    const { displayText: sText, isComplete: sDone } = useScrambleText(secondaryText, startAnimations);
    const { displayText: mText, isComplete: mDone } = useScrambleText(mainText, startAnimations);

    return (
        <div className="text-center mb-16 relative z-20 min-h-[200px] flex flex-col justify-center">
            <h2 className="text-lg md:text-2xl font-medium tracking-[0.2em] mb-3 font-mono uppercase h-8">
                <span className={`${sDone ? "text-cyan-400/90" : "text-white/40"} transition-all duration-1000`}>{sText}</span>
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white font-mono uppercase h-24">
                <span className={`${mDone ? "text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]" : "text-white/30"}`}>{mText}</span>
            </h1>
            <div className="mt-10 flex flex-col items-center gap-3">
                <span className="text-cyan-400 font-bold text-xs uppercase tracking-[0.4em] animate-pulse">{scrollText}</span>
                <ChevronDownIcon className="w-5 h-5 text-cyan-500/70" />
            </div>
        </div>
    );
};

const TextBlock = ({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-10% 0px" });
    const alignClass = align === "left" ? "items-start text-left" : align === "right" ? "items-end text-right ml-auto" : "items-center text-center mx-auto";
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} className={`flex flex-col ${alignClass} max-w-4xl w-full p-10 rounded-[2.5rem] backdrop-blur-2xl bg-black/70 border border-white/10 shadow-2xl relative overflow-hidden`}>
            <div className="relative z-10 space-y-6 text-slate-300 leading-relaxed font-light text-lg md:text-xl">{children}</div>
        </motion.div>
    );
};

// --- TECH MOTOR (Atualizado com forwardRef nomeado) ---
// CORREÇÃO 2: Usamos 'forwardRef' direto, sem 'React.forwardRef'
const TechMotor = forwardRef<HTMLDivElement, { text: string, index: number, isActive: boolean }>(
    ({ text, index, isActive }, ref) => {
        let colors = {
            ring: "border-white/10",
            core: "bg-black",
            text: "text-white/30",
            glow: ""
        };

        if (index <= 3) { // Nível 1
            colors = { ring: "border-cyan-500/30", core: "bg-cyan-950/40", text: "text-cyan-100", glow: "shadow-[0_0_30px_rgba(6,182,212,0.4)]" };
        } else if (index <= 5) { // Nível 2
            colors = { ring: "border-emerald-500/30", core: "bg-emerald-950/40", text: "text-emerald-100", glow: "shadow-[0_0_30px_rgba(16,185,129,0.4)]" };
        } else { // Nível 3
            colors = { ring: "border-yellow-500/30", core: "bg-yellow-950/40", text: "text-yellow-100", glow: "shadow-[0_0_40px_rgba(234,179,8,0.4)]" };
        }

        return (
            <div ref={ref} className="relative flex flex-col items-center justify-center mx-2 md:mx-6 z-20 py-4">
                {/* Anel Externo */}
                <motion.div
                    animate={{ rotate: isActive ? 360 : 0 }}
                    transition={{ duration: isActive ? 10 : 0, repeat: Infinity, ease: "linear" }}
                    className={`w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-dashed ${isActive ? colors.ring : 'border-white/5'} flex items-center justify-center transition-colors duration-500`}
                >
                    <div className="absolute inset-[-4px] rounded-full border border-white/5 opacity-50" />
                </motion.div>

                {/* Núcleo Central */}
                <motion.div
                    className={`absolute w-20 h-20 md:w-24 md:h-24 rounded-full ${colors.core} backdrop-blur-xl border border-white/10 flex items-center justify-center z-10 transition-all duration-500 ${isActive ? colors.glow : ''}`}
                    animate={{ scale: isActive ? 1.05 : 1 }}
                >
                <span className={`text-[9px] md:text-[10px] font-black uppercase text-center px-2 tracking-widest leading-tight ${isActive ? colors.text : 'text-white/10'}`}>
                    {text}
                </span>
                </motion.div>
            </div>
        );
    });
TechMotor.displayName = "TechMotor";

// --- REDE NEURAL SVG ---
const NeuralConnections = ({ positions, activeStates }: { positions: {x: number, y: number}[], activeStates: boolean[] }) => {
    if (positions.length === 0) return null;

    const connections = [
        // Nível 1 -> Nível 2
        { from: 0, to: 4 }, { from: 0, to: 5 },
        { from: 1, to: 4 }, { from: 1, to: 5 },
        { from: 2, to: 4 }, { from: 2, to: 5 },
        { from: 3, to: 4 }, { from: 3, to: 5 },
        // Nível 2 -> Nível 3
        { from: 4, to: 6 },
        { from: 5, to: 6 }
    ];

    return (
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            {connections.map((conn, i) => {
                const start = positions[conn.from];
                const end = positions[conn.to];
                const isActive = activeStates[conn.to];

                if (!start || !end) return null;

                return (
                    <motion.line
                        key={i}
                        x1={start.x} y1={start.y}
                        x2={end.x} y2={end.y}
                        stroke={isActive ? "rgba(34, 211, 238, 0.6)" : "rgba(255, 255, 255, 0.05)"}
                        strokeWidth={isActive ? "1.5" : "1"}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: isActive ? 1 : 0, opacity: isActive ? 1 : 0.3 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        style={{ filter: isActive ? "drop-shadow(0px 0px 3px rgba(34, 211, 238, 0.8))" : "none" }}
                    />
                );
            })}
        </svg>
    );
};

// --- REACTOR ZAEON BRAIN ---
const ZaeonBrainReactor = ({ isActive }: { isActive: boolean }) => {
    return (
        <motion.div
            className={`relative mt-16 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 z-20
                ${isActive ? 'drop-shadow-[0_0_80px_rgba(34,211,238,0.6)]' : ''}
            `}
        >
            <motion.div
                animate={{ rotate: isActive ? 360 : 0, scale: isActive ? 1.1 : 0.9 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-0 border-2 border-dashed rounded-full ${isActive ? 'border-cyan-500/50' : 'border-white/5'}`}
            />
            <motion.div
                animate={{ rotate: isActive ? -360 : 0, scale: isActive ? 1.05 : 0.95 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-2 border-2 border-dotted rounded-full ${isActive ? 'border-blue-500/30' : 'border-white/5'}`}
            />

            <div className="relative w-20 h-20 flex items-center justify-center">
                <Image
                    src="/zaeon-logo.png"
                    alt="Zaeon Brain Core"
                    fill
                    className={`object-contain transition-all duration-700 ${isActive ? 'brightness-125 contrast-125 drop-shadow-[0_0_15px_cyan]' : 'brightness-50 grayscale opacity-50'}`}
                />
            </div>

            <div className={`absolute -bottom-12 whitespace-nowrap text-[11px] uppercase tracking-[0.3em] font-bold transition-all duration-500 text-center ${isActive ? 'opacity-100 text-cyan-400' : 'opacity-0'}`}>
                Zaeon Neural Core<br/>Online
            </div>
        </motion.div>
    )
}

// --- COMPONENTE DE FLUXO AUTOMÁTICO ---
const CyberPyramidFlow = ({ t }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const motorRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [motorPositions, setMotorPositions] = useState<{x: number, y: number}[]>([]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 80%", "end center"]
    });

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange((v) => setProgress(v));
        return () => unsubscribe();
    }, [scrollYProgress]);

    const calculatePositions = useCallback(() => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        const newPositions = motorRefs.current.map(motor => {
            if (!motor) return { x: 0, y: 0 };
            const rect = motor.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2 - containerRect.left,
                y: rect.top + rect.height / 2 - containerRect.top
            };
        });
        setMotorPositions(newPositions);
    }, []);

    useEffect(() => {
        calculatePositions();
        window.addEventListener("resize", calculatePositions);
        const timeout = setTimeout(calculatePositions, 500);
        return () => {
            window.removeEventListener("resize", calculatePositions);
            clearTimeout(timeout);
        };
    }, [calculatePositions]);

    const steps = [
        t('about.architecture.flow.step1'), t('about.architecture.flow.step2'),
        t('about.architecture.flow.step3'), t('about.architecture.flow.step4'),
        t('about.architecture.flow.step5'), t('about.architecture.flow.step6'),
        t('about.architecture.flow.step7')
    ];

    const isLit = (threshold: number) => progress > threshold;

    const activeStates = [
        isLit(0.15), isLit(0.15), isLit(0.15), isLit(0.15), // Nível 1
        isLit(0.45), isLit(0.45), // Nível 2
        isLit(0.70) // Nível 3
    ];

    return (
        <div ref={containerRef} className="w-full max-w-6xl mx-auto mt-24 py-20 flex flex-col items-center relative z-50">

            <NeuralConnections positions={motorPositions} activeStates={activeStates} />

            {/* NÍVEL 1: Input (4 Motores) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-20 mb-24 w-full place-items-center">
                {[0, 1, 2, 3].map(idx => (
                    <TechMotor
                        key={idx}
                        // CORREÇÃO 3: Usamos a sintaxe correta para evitar retorno de valor no ref
                        ref={(el) => { motorRefs.current[idx] = el; }}
                        text={steps[idx]}
                        index={idx}
                        isActive={activeStates[idx]}
                    />
                ))}
            </div>

            {/* NÍVEL 2: Engine (2 Motores) */}
            <div className="flex gap-16 md:gap-48 mb-24 relative">
                {[4, 5].map(idx => (
                    <TechMotor
                        key={idx}
                        ref={(el) => { motorRefs.current[idx] = el; }}
                        text={steps[idx]}
                        index={idx}
                        isActive={activeStates[idx]}
                    />
                ))}
            </div>

            {/* NÍVEL 3: Output (1 Motor) */}
            <div className="mb-8">
                <TechMotor
                    ref={(el) => { motorRefs.current[6] = el; }}
                    text={steps[6]}
                    index={6}
                    isActive={activeStates[6]}
                />
            </div>

            {/* FINAL: Zaeon Brain Reactor */}
            <ZaeonBrainReactor isActive={isLit(0.90)} />

        </div>
    );
};

// --- SEÇÃO DE ARQUITETURA (Wrapper) ---
const ArchitectureSection = ({ t }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-20% 0px" });

    return (
        <div ref={ref} className="flex flex-col items-center w-full max-w-[1400px] mx-auto my-32 relative">
            <div className="relative w-full min-h-[600px] flex items-center justify-center px-4 lg:px-0 mb-24">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full lg:w-[70%] h-[400px] md:h-[600px] z-10 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.1)]"
                >
                    <Image src="/about/cyber-architecture.png" alt="Mantle RWA Architecture" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute right-4 lg:right-[5%] top-[15%] bottom-[15%] w-[90%] lg:w-[400px] z-20 flex flex-col justify-center"
                >
                    <div className="relative h-full bg-black border-r border-y border-white/20 rounded-r-2xl rounded-l-md shadow-[20px_0_60px_rgba(0,0,0,0.8)] p-8 flex flex-col justify-center gap-6 overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-black/80 to-black backdrop-blur-xl -z-10" />
                        <div className="relative z-30">
                            <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 mb-6" />
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{t('about.architecture.card_title')}</h3>
                            <p className="text-slate-300 font-light leading-relaxed text-sm md:text-base">{t('about.architecture.card_desc')}</p>
                            <div className="flex flex-wrap gap-2 mt-6">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-cyan-400 uppercase tracking-widest">Mantle Network</span>
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-purple-400 uppercase tracking-widest">RWA Engine</span>
                            </div>
                        </div>
                        <div className="absolute top-10 left-[-2px] bottom-10 w-[2px] bg-cyan-500/50 shadow-[0_0_15px_cyan]" />
                    </div>
                </motion.div>
            </div>

            <CyberPyramidFlow t={t} />
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
export default function AboutUsPage() {
    const { t, i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
    const [startAnimations, setStartAnimations] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsAtTop(window.scrollY < 80);
        window.addEventListener("scroll", handleScroll);
        setTimeout(() => setStartAnimations(true), 1500);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted || !i18n.isInitialized) {
        return <MacSplash minDurationMs={1500} />;
    }

    return (
        <div ref={containerRef} className={`relative min-h-[400vh] bg-[#030014] overflow-hidden font-sans transition-all duration-700 ${isAtTop ? 'z-0' : 'z-[200]'}`}>
            <button onClick={() => window.history.back()} className="fixed top-28 left-10 z-[300] flex items-center gap-3 text-white/40 hover:text-cyan-400 group">
                <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-xl bg-white/5 transition-all">
                    <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-0 group-hover:opacity-100 transition-opacity">{t('about.back')}</span>
            </button>

            <motion.div className="fixed inset-0 z-[190]" style={{ y: backgroundY }}>
                <Image src="/about/about-us-room.png" alt="Zaeon Facility" fill priority className="object-cover opacity-60" />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#030014] via-[#030014]/90 to-transparent" />
            </motion.div>

            <div className="relative z-[210] flex flex-col items-center pt-[32vh] pb-[40vh] px-6 gap-[20vh]">
                <CyberTitle startAnimations={startAnimations} secondaryText={t('about.title_secondary')} mainText={t('about.title_main')} scrollText={t('about.scroll_down')} />

                <TextBlock align="left">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide uppercase flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-cyan-500 shadow-[0_0_20px_cyan]"></span>
                        {t('about.genesis.title')}
                    </h2>
                    <p>{t('about.genesis.p1')}</p>
                    <p>{t('about.genesis.p2')} <span className="text-cyan-300 font-semibold">{t('about.genesis.p2_highlight')}</span></p>
                </TextBlock>

                <TextBlock align="right">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide uppercase flex items-center justify-end gap-3">
                        {t('about.mission.title')}
                        <span className="w-1.5 h-8 bg-purple-500 shadow-[0_0_20px_purple]"></span>
                    </h2>
                    <p className="text-xl md:text-2xl font-light italic text-white/90">{t('about.mission.p1')}</p>
                    <p className="text-base text-slate-400 mt-4">{t('about.mission.p2')}</p>
                </TextBlock>

                <ArchitectureSection t={t} />

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center relative z-40 pb-[10vh]">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tighter">{t('about.cta.tour_title')}</h2>
                    <button onClick={() => window.location.assign('/tour')}
                            className="group relative px-16 py-6 bg-black border-2 border-cyan-500/30 text-white font-black text-xl uppercase tracking-widest overflow-hidden hover:scale-105 transition-all duration-300 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-blue-700 to-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10 group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors">{t('about.cta.button_go')}</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}