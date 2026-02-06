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
    CurrencyDollarIcon,
    TrophyIcon
} from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

// --- TICKER DE PATROCINADORES ---
const SponsorsTicker = ({ opacity }: { opacity: any }) => {
  const { t } = useTranslation();
  const sponsors = [
    { name: "Funcap", src: "/sponsors/funcap.png", url: "https://www.funcap.ce.gov.br/" },
    { name: "Centelha", src: "/sponsors/centelha.png", url: "https://programacentelha.com.br/ce/" },
    { name: "Sudene", src: "/sponsors/sudene.png", url: "https://www.gov.br/sudene" },
    { name: "Finep", src: "/sponsors/finep.png", url: "http://www.finep.gov.br/" },
    { name: "Cnpq", src: "/sponsors/cnpq.png", url: "https://www.gov.br/cnpq/pt-br" },

  ];
  const tickerItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <motion.div style={{ opacity }} className="w-full py-8 overflow-hidden relative z-50">
     <div className="w-full flex justify-center mb-8">
      <h3 className="text-center text-[10px] font-black tracking-[0.4em] text-cyan-600 dark:text-cyan-400 uppercase opacity-0">     
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
        <img src={item.src} alt={item.name} className="max-w-full max-h-full object-contain opacity-100 transition-all duration-500" />
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

    return (
        <div className="w-full pt-20 pb-40 px-4 flex flex-col items-center justify-center bg-transparent relative z-40">
            {/* Título */}
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-white/40 mb-10 transition-colors duration-300">
                {t("encryption.recognition", "Recognition")}
            </h4>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="
                    relative w-full max-w-4xl rounded-[2rem] 
                    
                    /* --- MODO CLARO (Preto Transparente) --- */
                    border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl shadow-xl
                    
                    /* --- MODO ESCURO (Azul Transparente) --- */
                    dark:border-cyan-500/50 dark:bg-[#1e3a8a]/40 dark:shadow-[0_0_30px_rgba(6,182,212,0.15)]
                    
                    flex flex-col md:flex-row items-center justify-between
                    p-8 md:p-12 gap-8 group overflow-hidden
                    hover:border-yellow-500/50 transition-all duration-500
                "
            >
                {/* --- EFEITO DE FLASH / BRILHO PASSANDO --- */}
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none z-0">
                    <motion.div
                        className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                        initial={{ left: "-100%" }}
                        animate={{ left: "200%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 2.5,    
                            repeatDelay: 1,  
                            ease: "linear"
                        }}
                    />
                </div>

                {/* Coluna da Esquerda: Ícone e Texto */}
                <div className="flex flex-col gap-6 flex-1 text-center md:text-left items-center md:items-start z-10">
                    <div className="inline-flex items-center gap-3">
                        {/* Troféu Amarelo */}
                    </div>

                    {/* Texto Branco (Já que o fundo é preto ou azul escuro) */}
                    <h3 className="text-2xl md:text-3xl font-light text-white leading-tight">
                        <span className="font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">Blockchain</span> como Tecnologia de Uso Inteligente no Ceará
                    </h3>
                    
                    <p className="text-sm text-white/90 font-medium leading-relaxed max-w-lg">
                        Selecionado pelo programa{" "}
                        <a 
                            href="https://programacentelha.com.br/wp-content/uploads/2025/01/CE-Lista-Final-Empresas-Contratadas.pdf" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 decoration-cyan-500/50 hover:decoration-cyan-300 transition-all cursor-pointer relative z-50"
                        >
                            Centelha (2ª Edição)
                        </a>
                        , financiado diretamente pelo Ministério da Ciência, Tecnologia e Inovação do Governo Federal Brasileiro.
                    </p>
                </div>

                {/* Coluna da Direita: Logos MCTI */}
                <div className="w-full md:w-auto flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12 mt-2 md:mt-0 z-10">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest mb-6 font-semibold">Apoio Oficial</span>
                    
                    <div className="relative h-24 w-64 transition-all duration-300 group-hover:scale-105 opacity-90 group-hover:opacity-100">
                        {/* Imagem para modo CLARO (hidden no dark) */}
                        <img 
                            src="/sponsors/MCTI_light.png" 
                            alt="MCTI Logo" 
                            className="w-full h-full object-contain block dark:hidden" 
                        />
                        {/* Imagem para modo ESCURO (hidden no light) */}
                        <img 
                            src="/sponsors/MCTI_dark.png" 
                            alt="MCTI Logo" 
                            className="w-full h-full object-contain hidden dark:block" 
                        />
                    </div>
                </div>
            </motion.div>
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