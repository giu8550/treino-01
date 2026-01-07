"use client";

import { useState, useEffect, useLayoutEffect, Suspense } from "react";
import { useTranslation } from "react-i18next"; // Importe o hook
import Hero from "@/components/main/hero";
import Encryption from "@/components/main/encryption";
import StudyRoomsPage from "@/app/study-rooms/page";
import MacSplash from "@/components/ui/MacSplash";

export default function Home() {
    const { i18n } = useTranslation(); // Acesse a instância
    const [isLoading, setIsLoading] = useState(true);

    const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.history.scrollRestoration = "manual";
            document.body.style.overflow = "hidden";
            window.scrollTo(0, 0);
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useIsomorphicLayoutEffect(() => {
        if (!isLoading) {
            window.scrollTo(0, 0);
            const unlockTimer = setTimeout(() => {
                document.body.style.overflow = "";
            }, 10);
            return () => clearTimeout(unlockTimer);
        }
    }, [isLoading]);

    // PULO DO GATO: Se o carregamento terminou MAS o i18n ainda não inicializou,
    // continuamos mostrando o Splash para evitar erro de instância nos componentes filhos.
    const showSplash = isLoading || !i18n.isInitialized;

    return (
        <main className="h-full w-full">
            {showSplash ? (
                <div className="fixed inset-0 z-[99999] bg-[#030014] overflow-hidden">
                    <MacSplash minDurationMs={2000} />
                </div>
            ) : (
                <div className="flex flex-col gap-20">
                    <Hero />
                    <Encryption />
                    <div id="study-rooms" className="w-full">
                        <Suspense fallback={null}>
                            <StudyRoomsPage />
                        </Suspense>
                    </div>
                </div>
            )}
        </main>
    );
}