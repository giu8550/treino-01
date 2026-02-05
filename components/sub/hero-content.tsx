"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

// Componentes Internos (Certifique-se de que os caminhos existam)
import MenuNavigation from "@/components/sub/MenuNavigation";
import StarBackground from "@/components/main/star-background"; 
import GameHint from "@/src/components/ui/game-hint";

export default function HeroPage() {
  const { t } = useTranslation();
  
  // Estados para controlar o Scroll e visibilidade
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);

  // Recuperando a animação original de Scroll (1.5s)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Se scrollar para baixo mais de 50px, esconde. Se subir, mostra.
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShow(false);
      } else {
        setShow(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Definição da transição original [velocidade e curva]
  const transition = { duration: 1.5, ease: [0.23, 1, 0.32, 1] };

  return (
    <main className="w-full min-h-screen flex justify-start items-start relative px-4 md:pl-20 py-12 overflow-hidden bg-white dark:bg-[#05080a] transition-colors duration-700">
      
      {/* 1. BACKGROUND DE ESTRELAS (Sempre no fundo) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <StarBackground />
      </div>

      {/* 2. IMAGEM LATERAL (Animada vindo da direita) */}
      <motion.div 
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: show ? 0 : "100%", opacity: show ? 1 : 0 }}
        transition={transition}
        className="absolute -right-80 top-20 bottom-0 w-[85vw] max-w-none pointer-events-none z-10 hidden lg:block overflow-hidden"
      >
        <Image 
          src="/assets/computer.png" 
          alt="Workstation Image" 
          fill
          className="object-right object-top object-contain opacity-95"
          priority
        />
      </motion.div>

      {/* 3. CONTEÚDO PRINCIPAL (Menu e Dicas) */}
      <div className="flex flex-col items-start z-20">
        
        {/* Animação do Menu vindo da esquerda */}
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: show ? 0 : "-100%", opacity: show ? 1 : 0 }}
          transition={transition}
        >
          <MenuNavigation />
        </motion.div>

        {/* Animação das Dicas com um pequeno atraso (delay 0.1) */}
        <motion.div 
          className="mt-4 w-full max-w-[480px]"
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: show ? 0 : "-120%", opacity: show ? 1 : 0 }}
          transition={{ ...transition, delay: 0.1 }}
        >
          <GameHint 
            isVisible={show} 
            hints={[
              t("hints.new_game", "DICA: Inicie com um perfil novo para conferir a tecnologia."),
              t("hints.save_progress", "DICA: Conecte sua conta Google para salvar progresso."),
              t("hints.roles", "DICA: Cada classe libera ferramentas exclusivas.")
            ]} 
          />
        </motion.div>
      </div>
    </main>
  );
}