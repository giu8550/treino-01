"use client";

import { motion, useScroll, useTransform, AnimatePresence, LayoutGroup } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { 
    PlayIcon, 
    XMarkIcon, 
    CpuChipIcon, 
    AcademicCapIcon, 
    BeakerIcon, 
    DocumentTextIcon, 
    ScaleIcon, 
    LinkIcon, 
    LightBulbIcon, 
    CurrencyDollarIcon 
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

// --- TICKER DE PATROCINADORES ---
const SponsorsTicker = ({ opacity }: { opacity: any }) => {
  const { t } = useTranslation();
  const sponsors = [
    { name: "Funcap", src: "/sponsors/funcap.jpg", url: "https://www.funcap.ce.gov.br/" },
    { name: "Centelha", src: "/sponsors/centelha.png", url: "https://programacentelha.com.br/ce/" },
    { name: "Sudene", src: "/sponsors/sudene.png", url: "https://www.gov.br/sudene" },
    { name: "Finep", src: "/sponsors/finep.png", url: "http://www.finep.gov.br/" },
    { name: "Governo", src: "/sponsors/gov.svg", url: "https://www.gov.br/" },
  ];
  const tickerItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <motion.div style={{ opacity }} className="w-full py-8 overflow-hidden relative z-50">
     <div className="w-full flex justify-center mb-8">
      <h3 className="text-center text-[10px] font-black tracking-[0.4em] text-cyan-600 dark:text-cyan-400 uppercase opacity-70">     
        {t("hero.sponsors_title", "SPONSORS:")}
      </h3>
    </div>
      <div className="relative"> 
        <div className="flex whitespace-nowrap">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
            className="flex gap-8 px-6"
          >
            {tickerItems.map((item, i) => (
              <SponsorCard key={i} item={item} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const SponsorCard = ({ item }: { item: { name: string; src: string; url: string } }) => {
  return (
    <motion.a
      href={item.url} target="_blank" rel="noopener noreferrer"
      whileHover={{ scale: 1.05, borderColor: "rgba(34, 211, 238, 0.4)", backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      className="relative flex items-center justify-center min-w-[200px] h-[100px] rounded-[1.5rem] border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-md transition-all duration-500 group overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12)_0%,transparent_70%)]" />
      <div className="relative w-full h-full p-6 flex items-center justify-center">
        <img src={item.src} alt={item.name} className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0" />
      </div>
    </motion.a>
  );
};

const TypingEffect = ({ text, className }: { text: string; className: string }) => {
    const characters = Array.from(text);
    return (
        <motion.div className={className} style={{ whiteSpace: "nowrap" }}>
            {characters.map((char, i) => (
                <motion.span key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.03, delay: i * 0.02 }} viewport={{ once: true }}>{char}</motion.span>
            ))}
        </motion.div>
    );
};

// --- FLUXOGRAMA "LIQUID GLASS" ---
const ProcessFlowchart = () => {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState<number | null>(null);

    // Mapeamento dinâmico usando as chaves de tradução
    const steps = [
        { id: 1, title: t("encryption.steps.vertex.title"), fullTitle: t("encryption.steps.vertex.full"), icon: <CpuChipIcon className="w-5 h-5" />, desc: t("encryption.steps.vertex.desc"), color: "text-blue-400", border: "border-blue-500/30" },
        { id: 2, title: t("encryption.steps.students.title"), fullTitle: t("encryption.steps.students.full"), icon: <AcademicCapIcon className="w-5 h-5" />, desc: t("encryption.steps.students.desc"), color: "text-green-400", border: "border-green-500/30" },
        { id: 3, title: t("encryption.steps.research.title"), fullTitle: t("encryption.steps.research.full"), icon: <BeakerIcon className="w-5 h-5" />, desc: t("encryption.steps.research.desc"), color: "text-purple-400", border: "border-purple-500/30" },
        { id: 4, title: t("encryption.steps.publish.title"), fullTitle: t("encryption.steps.publish.full"), icon: <DocumentTextIcon className="w-5 h-5" />, desc: t("encryption.steps.publish.desc"), color: "text-yellow-400", border: "border-yellow-500/30" },
        { id: 5, title: t("encryption.steps.compliance.title"), fullTitle: t("encryption.steps.compliance.full"), icon: <ScaleIcon className="w-5 h-5" />, desc: t("encryption.steps.compliance.desc"), color: "text-red-400", border: "border-red-500/30" },
        { id: 6, title: t("encryption.steps.blockchain.title"), fullTitle: t("encryption.steps.blockchain.full"), icon: <LinkIcon className="w-5 h-5" />, desc: t("encryption.steps.blockchain.desc"), color: "text-cyan-400", border: "border-cyan-500/30" },
        { id: 7, title: t("encryption.steps.ip.title"), fullTitle: t("encryption.steps.ip.full"), icon: <LightBulbIcon className="w-5 h-5" />, desc: t("encryption.steps.ip.desc"), color: "text-orange-400", border: "border-orange-500/30" },
        { id: 8, title: t("encryption.steps.token.title"), fullTitle: t("encryption.steps.token.full"), icon: <CurrencyDollarIcon className="w-5 h-5" />, desc: t("encryption.steps.token.desc"), color: "text-emerald-400", border: "border-emerald-500/30" },
    ];

    return (
        <div className="w-full pt-20 pb-40 px-4 flex flex-col items-center justify-end bg-transparent relative z-40">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-10">
                {t("encryption.pipeline_title", "The Zaeon Pipeline")}
            </h4>
            
            <LayoutGroup>
                <div className="flex items-center justify-center w-full max-w-[1200px] h-[260px] gap-2">
                    {steps.map((step) => {
                        const isActive = activeId === step.id;
                        return (
                            <motion.div
                                layout
                                key={step.id}
                                onClick={() => setActiveId(isActive ? null : step.id)}
                                onHoverStart={() => setActiveId(step.id)}
                                className={`
                                    relative h-full rounded-2xl cursor-pointer overflow-hidden 
                                    transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                                    backdrop-blur-md border border-white/5
                                    bg-black/20 hover:bg-black/40
                                    dark:bg-cyan-900/10 dark:hover:bg-cyan-900/30 dark:border-cyan-500/20
                                    ${isActive 
                                        ? `flex-[3.5] z-10 bg-black/60 border-white/20 dark:bg-cyan-900/40 dark:border-cyan-400/50 shadow-[0_10px_40px_rgba(0,0,0,0.3)] dark:shadow-[0_0_30px_rgba(34,211,238,0.15)]` 
                                        : `flex-[1] z-0 opacity-70 hover:opacity-100`
                                    }
                                `}
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                    <motion.div 
                                        layout
                                        className={`
                                            p-2 rounded-xl mb-3 transition-colors duration-300
                                            ${isActive ? `bg-white/10 ${step.color}` : "bg-transparent text-white/30"}
                                        `}
                                    >
                                        {step.icon}
                                    </motion.div>

                                    <motion.h3 
                                        layout
                                        className={`
                                            font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300
                                            ${isActive ? "text-xs text-white mb-2 rotate-0" : "text-[9px] text-white/40 -rotate-90 mt-4"}
                                        `}
                                    >
                                        {isActive ? step.fullTitle : step.title}
                                    </motion.h3>

                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className="text-center"
                                            >
                                                <div className={`w-8 h-[2px] mx-auto my-2 bg-gradient-to-r from-transparent via-${step.color.split('-')[1]}-400 to-transparent opacity-50`} />
                                                <p className="text-[10px] text-slate-300 font-light leading-relaxed max-w-[180px] mx-auto">
                                                    {step.desc}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </LayoutGroup>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (PÁGINA) ---
export default function Encryption() {
    const { t } = useTranslation();
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

    const scale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.95, 1.35, 1.35, 0.85]);
    const videoOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.1, 1, 1, 0]);
    const sponsorsOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.85, 1], [0, 1, 1, 0]);

    if (!mounted) return <div className="min-h-screen bg-transparent" />;

    return (
        <div className="w-full relative">
            <section 
                ref={sectionRef} 
                className="relative z-[30] min-h-[200vh] w-full bg-transparent flex flex-col items-center pt-40"
            >
                {/* TÍTULO PRINCIPAL DINÂMICO */}
                <div className="w-full max-w-7xl text-center mb-16 px-4">
                    <TypingEffect 
                      text={t("encryption.typing_title", "A new way to produce science.")} 
                      className="text-slate-900 dark:text-white text-[6vw] md:text-[64px] font-extralight tracking-tighter" 
                    />
                </div>

                {/* VÍDEO (STICKY) & PATROCINADORES */}
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

                    <div className="w-full pointer-events-auto mt-auto mb-10">
                        <SponsorsTicker opacity={sponsorsOpacity} />
                    </div>
                </div>

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
            
            {/* FLUXOGRAMA NO FINAL */}
            <ProcessFlowchart />
        </div>
    );
}