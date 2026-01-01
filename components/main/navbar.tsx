"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic"; // Import para SSR
import { useTranslation } from "react-i18next";
import logoPng from "@/app/zaeon-name.png";

// Importação do Botão de Tema (Essencial para sua feature nova)
import ThemeToggle from "@/components/sub/ThemeToggle";
// Ajuste o caminho do i18n se necessário
import "../../src/i18n";

const NavbarComponent = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
      <div className="w-full h-[90px] fixed top-0 z-50 flex justify-center items-center pointer-events-none">
        {/* pointer-events-auto no filho para que o clique funcione, mas o container não bloqueie a chuva */}
        <div className="pointer-events-auto w-[96%] max-w-[1250px] h-[58px] rounded-3xl backdrop-blur-md
                        bg-background/80 border border-foreground/10 shadow-lg
                        flex items-center justify-between px-6 md:px-10 transition-all duration-300">

          {/* LOGO */}
          <Link href="/" className="flex items-center justify-center">
            <Image
                src={logoPng}
                alt="zaeonlogo"
                width={190}
                height={100}
                priority
                draggable={false}
                className="h-8 w-auto object-contain invert dark:invert-0 transition-all" // Inverte cor no modo claro se for PNG preto/branco
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex justify-center flex-1 gap-12 text-[14px] font-medium text-foreground/80 tracking-wide">
            <Link href="#about-us" className="hover:text-cyan-500 dark:hover:text-[#5fb4ff] transition-all duration-200 hover:scale-105">
              {t("navbar.about")}
            </Link>
            <Link href="#roadmap" className="hover:text-cyan-500 dark:hover:text-[#5fb4ff] transition-all duration-200 hover:scale-105">
              {t("navbar.roadmap")}
            </Link>
            <Link href="#study-rooms" className="hover:text-cyan-500 dark:hover:text-[#5fb4ff] transition-all duration-200 hover:scale-105">
              {t("navbar.study_rooms")}
            </Link>
          </nav>

          {/* DIREITA: TEMA + MOBILE TOGGLE */}
          <div className="flex items-center gap-4">
            {/* Botão de Tema Integrado */}
            <ThemeToggle />

            {/* Hamburger Mobile */}
            <button
                className="md:hidden text-foreground focus:outline-none text-2xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* MENU MOBILE EXPANDIDO */}
        {isMobileMenuOpen && (
            <div className="pointer-events-auto absolute top-[80px] w-[90%] max-w-[400px] rounded-2xl bg-background/95 border border-foreground/10 backdrop-blur-xl p-6 flex flex-col items-center text-foreground shadow-2xl animate-in slide-in-from-top-5">
              <Link href="#about-us" className="py-3 w-full text-center hover:bg-foreground/5 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                {t("navbar.about")}
              </Link>
              <Link href="#roadmap" className="py-3 w-full text-center hover:bg-foreground/5 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                {t("navbar.roadmap")}
              </Link>
              <Link href="#study-rooms" className="py-3 w-full text-center hover:bg-foreground/5 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                {t("navbar.study_rooms")}
              </Link>
            </div>
        )}
      </div>
  );
};

// SSR: false é vital para evitar erros de hidratação na Navbar (por causa do i18n e Theme)
export const Navbar = dynamic(() => Promise.resolve(NavbarComponent), { ssr: false });