"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HyperText from "src/components/ui/hyper-text";

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const { t } = useTranslation();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500); // Linha 1 começa
    const t2 = setTimeout(() => setStage(2), 1800); // Linha 2 começa (ritmo dinâmico)
    
    // Tempo total de 5 segundos para uma transição fluida para o site
    const tEnd = setTimeout(onComplete, 5000); 

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(tEnd);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center !bg-white overflow-hidden font-[family-name:var(--font-outfit)]"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        filter: "blur(30px)", 
        transition: { duration: 1.2, ease: "easeInOut" } 
      }}
    >
      <div className="flex flex-col items-center justify-center w-full px-10 text-center">
        {/* Espaçamento elegante e cor preta unificada */}
        <div className="flex flex-col gap-6 font-semibold tracking-[0.1em] leading-tight uppercase">
          
          {stage >= 1 && (
            <div style={{ fontSize: "clamp(1.1rem, 3.2vw, 2.2rem)" }} className="!text-black">
              <HyperText text={t("intro.line1")} />
            </div>
          )}
          
          {stage >= 2 && (
            <div style={{ fontSize: "clamp(1.1rem, 3.2vw, 2.2rem)" }} className="!text-black">
              <HyperText text={t("intro.line2")} />
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE LOADING MAC STYLE */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center">
        <div className="w-48 md:w-64 h-[3px] !bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.5, ease: "linear" }}
            className="h-full !bg-black rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}