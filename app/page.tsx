"use client";

import { useState, useEffect, useLayoutEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

// Componentes da Home
import Hero from "@/components/main/hero";
import Encryption from "@/components/main/encryption";
import StudyRoomsPage from "@/app/study-rooms/page";
import IntroOverlay from "@/src/components/main/intro-overlay"; 
import { Navbar } from "@/components/main/navbar";
import { Footer } from "@/components/main/footer";

// Carregamento dinâmico do background para não pesar na tela branca inicial
const StarsCanvas = dynamic(
    () => import("@/components/main/star-background"),
    { ssr: false }
);

export default function Home() {
    const { i18n } = useTranslation();
    const [showIntro, setShowIntro] = useState(true);
    const [startContent, setStartContent] = useState(false);

    const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

    // Bloqueia scroll durante a intro
    useEffect(() => {
        if (showIntro) {
            document.body.style.overflow = "hidden";
            window.scrollTo(0, 0);
        } else {
            const t = setTimeout(() => { document.body.style.overflow = ""; }, 100);
            return () => clearTimeout(t);
        }
    }, [showIntro]);

    useIsomorphicLayoutEffect(() => {
        window.history.scrollRestoration = "manual";
    }, []);

    const handleIntroComplete = () => {
        setShowIntro(false);
        // Pequeno delay para sincronizar com o fim do fade-out da intro
        setTimeout(() => {
            setStartContent(true);
        }, 400); 
    };

    return (
        <main className="h-full w-full">
            <AnimatePresence mode="wait">
                {showIntro && (
                    <IntroOverlay key="intro-overlay" onComplete={handleIntroComplete} />
                )}
            </AnimatePresence>

            {/* O conteúdo "Zaeon" só existe após a intro */}
            {startContent && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 1.5 }}
                >
                    {/* Background e Navbar aparecem agora */}
                    <StarsCanvas />
                    <Navbar />
                    
                    <div className="flex flex-col gap-20">
                        <Hero />
                        <Encryption />
                        <div id="study-rooms" className="w-full">
                            <Suspense fallback={null}>
                                <StudyRoomsPage />
                            </Suspense>
                        </div>
                    </div>
                    <Footer />
                </motion.div>
            )}
        </main>
    );
}