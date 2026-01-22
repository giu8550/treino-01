"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HyperText from "src/components/ui/hyper-text";

export default function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"line1" | "line2" | "pause" | "squash" | "loading">("line1");

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setPhase("line2"), 1600);
    const t2 = setTimeout(() => setPhase("pause"), 3200);
    const t3 = setTimeout(() => setPhase("squash"), 3900);
    const t4 = setTimeout(() => setPhase("loading"), 4300);
    const tEnd = setTimeout(onComplete, 6000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); 
      clearTimeout(t3); clearTimeout(t4); clearTimeout(tEnd);
    };
  }, [onComplete]);

  // Fundo neutro durante a hidratação
  if (!mounted) return <div className="fixed inset-0 z-[99999] bg-white dark:bg-[#030014]" />;

  return (
    <motion.div
      // DINÂMICO: bg-white por padrão, bg-background no dark mode
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white dark:bg-[#030014] overflow-hidden font-[family-name:var(--font-outfit)]"
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      <div className="relative flex flex-col items-center justify-center w-full">
        <AnimatePresence>
          {phase !== "loading" && (
            <motion.div
              initial={{ opacity: 1, scaleY: 1 }}
              animate={phase === "squash" ? { 
                scaleY: 0, 
                opacity: 0, 
                filter: "blur(10px)",
              } : { scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.45, 0, 0.55, 1] }}
              // DINÂMICO: Texto preto no light, branco no dark
              className="flex flex-col gap-8 font-semibold leading-tight uppercase text-center text-black dark:text-white"
            >
              <div style={{ fontSize: "clamp(1.2rem, 4vw, 2.5rem)" }}>
                <HyperText text={t("intro.line1", "STUDY, LEARN, RESEARCH")} />
              </div>
              
              {(phase === "line2" || phase === "pause" || phase === "squash") && (
                <div style={{ fontSize: "clamp(1.2rem, 4vw, 2.5rem)" }}>
                  <HyperText text={t("intro.line2", "PUBLISH / MONETIZE.")} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "loading" && (
          <motion.div 
            initial={{ width: "60px", opacity: 0 }}
            animate={{ width: "240px", opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            // DINÂMICO: Trilho da barra se ajusta ao fundo
            className="h-[3px] bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden relative"
          >
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              // DINÂMICO: Barra preta no light, branca no dark
              className="h-full bg-black dark:bg-white rounded-full"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}