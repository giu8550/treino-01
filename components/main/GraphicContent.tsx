"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Componentes Internos
import MenuNavigation from "../sub/MenuNavigation";
// Se o GameHint não existir no seu projeto, comente a linha abaixo
import GameHint from "@/src/components/ui/game-hint"; 

export default function GraphicContent() {
  const { t } = useTranslation();

  // Estados para controlar o Scroll e visibilidade
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);

  // Lógica de Scroll (Esconde ao descer, mostra ao subir)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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

  // Transição suave
  const transition = { duration: 1.5, ease: [0.23, 1, 0.32, 1] };

  return (
    <main className="w-full min-h-screen flex justify-start items-start relative px-4 md:pl-20 py-12 overflow-hidden bg-white dark:bg-[#05080a] transition-colors duration-700">

      {/* 2. IMAGEM LATERAL COM GLITCH E TAMANHO AJUSTADO */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: show ? 0 : "100%", opacity: show ? 1 : 0 }}
        transition={transition}
        className="absolute -right-60 top-0 bottom-0 w-[95vw] max-w-none pointer-events-none z-10 hidden lg:block overflow-hidden"
      >
        <div className="relative w-full h-full">
          <Image
            src="/assets/computer.png"
            alt="Workstation Image"
            fill
            className="object-right object-center object-contain opacity-95"
            style={{
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
            }}
            priority
          />

          {/* Camada de Glitch na base */}
          <div className="absolute bottom-10 right-0 w-full h-40 opacity-40 mix-blend-overlay">
            <div className="absolute bottom-4 right-20 w-1/2 h-[2px] bg-cyan-400 animate-pulse" />
            <div className="absolute bottom-10 right-40 w-1/3 h-[1px] bg-purple-600 animate-bounce" style={{ animationDuration: '2.5s' }} />
            <div className="absolute bottom-16 right-10 w-1/4 h-[3px] bg-white opacity-20" />
            <div className="absolute bottom-2 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
          </div>
        </div>
      </motion.div>

      {/* 3. CONTEÚDO PRINCIPAL (COLUNA DA ESQUERDA) */}
      <div className="flex flex-col items-start z-20 w-full max-w-[420px]">
        {/* Menu Navigation */}
        <motion.div
          className="w-full"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: show ? 0 : "-100%", opacity: show ? 1 : 0 }}
          transition={transition}
        >
          <MenuNavigation />
        </motion.div>

        {/* Game Hints */}
        <motion.div
          className="mt-4 w-full"
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