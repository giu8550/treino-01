"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import whoAre from "@/app/who-are-zaeon.png";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

export default function Encryption() {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const reduced = useMemo(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
        []
    );

    if (!mounted) return null;

    // --- ANIMAÇÃO DE TEXTO (SLOT MACHINE) ---
    const SlotMachineText = ({ text, className, delay = 0 }: { text: string, className: string, delay?: number }) => {
        const characters = Array.from(text);
        const containerVariants: Variants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: { staggerChildren: 0.03, delayChildren: delay }
            }
        };
        const letterVariants: Variants = {
            hidden: { y: 20, opacity: 0, filter: "blur(5px)" },
            visible: {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                transition: { type: "spring", damping: 15, stiffness: 200 }
            }
        };

        return (
            <motion.div
                className={className}
                initial="hidden"
                whileInView="visible"
                // Ajustado para disparar apenas quando estiver 20% visível na tela
                viewport={{ once: true, margin: "-20%" }} 
                variants={containerVariants}
                style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.02em" }}
            >
                {characters.map((char, index) => (
                    <motion.span key={index} variants={letterVariants} style={{ display: "inline-block", whiteSpace: "pre" }}>
                        {char}
                    </motion.span>
                ))}
            </motion.div>
        );
    };

    return (
        // AJUSTE PRINCIPAL: motion.section com fade-in global e delay
        <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            // O delay de 0.8s garante que o Hero já terminou sua animação inicial
            transition={{ duration: 1, delay: 0.8 }} 
            className="relative flex flex-col items-center justify-center min-h-screen w-full bg-transparent py-20 overflow-hidden"
        >
            <div className="absolute top-0 w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute bottom-0 w-full h-[1px] bg-cyan-500/20" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-[1400px]">

                {/* 1. TÍTULO SUPERIOR */}
                <div className="mb-4 px-4 text-center">
                    <SlotMachineText
                        text={t("encryption.title")}
                        className="select-none text-black dark:text-white text-[32px] sm:text-[54px] font-extralight tracking-tighter"
                    />
                </div>

                {/* 2. IMAGEM (PNG) */}
                <div className="flex items-center justify-center mb-0 w-full px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        animate={reduced ? {} : {
                            y: [0, -30, 0],
                            rotate: [0, -1.5, 1.5, 0],
                            x: [0, 5, -5, 0]
                        }}
                        transition={{
                            y: { duration: 7, ease: "easeInOut", repeat: Infinity },
                            rotate: { duration: 9, ease: "easeInOut", repeat: Infinity },
                            x: { duration: 11, ease: "easeInOut", repeat: Infinity },
                            initial: { duration: 1.2, delay: 0.2 }
                        }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.4 } }}
                        className="relative drop-shadow-[0_0_50px_rgba(34,211,238,0.2)] dark:drop-shadow-[0_0_100px_rgba(34,211,238,0.3)]"
                    >
                        <Image
                            src={whoAre}
                            alt="Who are Zaeon"
                            priority
                            className="w-full max-w-[900px] h-auto select-none pointer-events-none"
                        />
                    </motion.div>
                </div>

                {/* 3. SUBTÍTULO */}
                <div className="mb-8 px-6 max-w-5xl text-center">
                    <SlotMachineText
                        text={t("encryption.subtitle")}
                        delay={0.6}
                        className="select-none text-slate-800 dark:text-slate-100 text-[24px] sm:text-[36px] font-light tracking-tight leading-snug"
                    />
                </div>

                {/* 4. BOTÃO LEARN MORE */}
                <div className="z-20">
                    <motion.button
                        onClick={() => window.location.assign("/about")}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 0 30px rgba(34,211,238,0.5)",
                            borderColor: "rgba(34,211,238,1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="px-14 py-4 rounded-full font-bold uppercase tracking-[0.3em] text-[13px]
                        transition-all duration-300
                        bg-white dark:bg-black
                        text-black dark:text-white
                        border-2 border-cyan-500/40 dark:border-cyan-400/50 shadow-lg"
                    >
                        {t("encryption.button")}
                    </motion.button>
                </div>
            </div>
        </motion.section>
    );
}