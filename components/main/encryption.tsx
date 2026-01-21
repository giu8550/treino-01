"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { PlayIcon, XMarkIcon, CpuChipIcon, ShieldCheckIcon, GlobeAltIcon } from "@heroicons/react/24/solid";

// --- NOVOS CARDS ANIMADOS ---
const InfoCards = () => {
    const cards = [
        { 
            title: "Edge Computing", 
            desc: "Processamento de dados em tempo real com latência zero para agentes de IA.",
            icon: <CpuChipIcon className="w-8 h-8 text-cyan-400" /> 
        },
        { 
            title: "Encryption Layer", 
            desc: "Segurança de nível militar (AES-256) protegendo cada descoberta científica.",
            icon: <ShieldCheckIcon className="w-8 h-8 text-purple-400" /> 
        },
        { 
            title: "Global Network", 
            desc: "Infraestrutura descentralizada conectando laboratórios ao redor do mundo.",
            icon: <GlobeAltIcon className="w-8 h-8 text-blue-400" /> 
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-6 mt-24 mb-20 relative z-50">
            {cards.map((card, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all group"
                >
                    <div className="mb-4 group-hover:scale-110 transition-transform">{card.icon}</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
                </motion.div>
            ))}
        </div>
    );
};

// --- TICKER DE SPONSORS ---
const SponsorsTicker = ({ opacity }: { opacity: any }) => {
    const logos = [
        { name: "Google", src: "https://authjs.dev/img/providers/google.svg" },
        { name: "Google Cloud", src: "https://www.gstatic.com/images/branding/product/2x/google_cloud_64dp.png" },
        { name: "x402", src: "https://cryptologos.cc/logos/elrond-egld-egld-logo.png" },
        { name: "Cronos", src: "https://cryptologos.cc/logos/cronos-cro-logo.png" },
    ];

    return (
        <motion.div style={{ opacity }} className="w-full py-10 overflow-hidden mt-20">
            <div className="flex whitespace-nowrap overflow-hidden">
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 25, repeat: Infinity }}
                    className="flex gap-20 items-center"
                >
                    {[...logos, ...logos].map((logo, i) => (
                        <div key={i} className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <img src={logo.src} alt={logo.name} className="h-8 w-auto object-contain" />
<span className="text-white/80 text-lg font-light tracking-widest uppercase"></span>                        </div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};

// --- TYPING EFFECT ---
const TypingEffect = ({ text, className }: { text: string; className: string }) => {
    const characters = Array.from(text);
    return (
        <motion.div className={className} style={{ whiteSpace: "nowrap" }}>
            {characters.map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.03, delay: i * 0.02 }}
                    viewport={{ once: true }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default function Encryption() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    // CORREÇÃO: O vídeo agora cresce até 0.4 e começa a diminuir a partir de 0.8
    const scale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.95, 1.35, 1.35, 0.85]);
    const videoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.1, 1, 1, 0]);
    const sponsorsOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.85, 1], [0, 1, 1, 0]);

    if (!mounted) return <div className="min-h-screen bg-transparent" />;

    return (
        <section 
            ref={sectionRef} 
            className="relative z-[30] min-h-[200vh] w-full bg-transparent flex flex-col items-center pt-40 overflow-x-hidden"
        >
            {/* TÍTULO PRINCIPAL - SUBIDO MAIS UM POUCO (pt-40 e mb-16) */}
            <div className="w-full max-w-7xl text-center mb-16 px-4">
                <TypingEffect 
                    text="Um novo jeito de produzir ciência."
                    className="text-slate-900 dark:text-white text-[6vw] md:text-[64px] font-extralight tracking-tighter"
                />
            </div>

            {/* VÍDEO (STICKY) */}
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-none">
                <motion.div 
                    style={{ scale, opacity: videoOpacity }}
                    className="relative w-[95%] max-w-[1200px] aspect-video bg-zinc-900 shadow-[0_0_80px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden group cursor-pointer pointer-events-auto"
                    onClick={() => setIsVideoOpen(true)}
                >
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                        <source src="/assets/encryption-bg.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayIcon className="w-20 h-20 text-white drop-shadow-2xl" />
                    </div>
                </motion.div>

                <div className="w-full pointer-events-auto">
                    <SponsorsTicker opacity={sponsorsOpacity} />
                </div>
            </div>

            {/* NOVOS CARDS */}
            <InfoCards />

            {/* MODAL DO VÍDEO */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                        <button onClick={() => setIsVideoOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><XMarkIcon className="w-10 h-10" /></button>
                        <div className="w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl">
                            <iframe className="w-full h-full" src="https://www.youtube.com/embed/SuaIDAqui?autoplay=1" allow="autoplay; fullscreen" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}