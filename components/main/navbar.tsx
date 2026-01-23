"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import logoPng from "@/app/zaeon-name.png";

import ThemeToggle from "@/components/sub/ThemeToggle";
import "../../src/i18n";

const NavbarComponent = () => {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Previne que a Navbar fique invisível caso o i18n demore a responder em rotas específicas
  if (!mounted) {
    return <div className="w-full h-[90px] fixed top-0 z-[100]" />;
  }

  // --- LÓGICA DE PERMISSÃO E VISIBILIDADE ---
  const user = session?.user as any;
  const role = user?.role;
  const email = user?.email?.toLowerCase();

  const isFounder = email === "donmartinezcaiudoceu@gmail.com";
  const isSessionAdmin = user?.isAdmin === true;
  const isSuperUser = isFounder || isSessionAdmin;

  const isStudentGroup = role === "student" || role === "researcher";
  const isProGroup = role === "professional" || role === "entrepreneur";

  const showHomework = isSuperUser || isStudentGroup;
  const showWorkstation = isSuperUser || isProGroup;

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const baseLinkStyle = "transition-all duration-200 hover:scale-105 cursor-pointer";
  const inactiveStyle = "text-foreground/80 hover:text-cyan-500 dark:hover:text-[#5fb4ff]";
  const activeStyle = "text-cyan-500 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] scale-105";

  const getLinkClassName = (path: string) => {
    return `${baseLinkStyle} ${isActive(path) ? activeStyle : inactiveStyle}`;
  };

  return (
      <div className="w-full h-[90px] fixed top-0 z-[100] flex justify-center items-center pointer-events-none">
        <div className="pointer-events-auto w-[96%] max-w-[1250px] h-[70px] rounded-3xl backdrop-blur-md
                        bg-background/80 border border-foreground/10 shadow-lg
                        flex items-center justify-between px-6 md:px-10 transition-all duration-300">

          <Link href="/" className="flex items-center justify-center">
            <Image
                src={logoPng}
                alt="zaeonlogo"
                width={280}
                height={150}
                priority
                className="h-12 w-auto object-contain invert dark:invert-0 transition-all"
            />
          </Link>

          <nav className="hidden md:flex justify-center flex-1 gap-12 text-[14px] font-medium tracking-wide">
            {/* Ajustado para o path /about conforme solicitado */}
            <Link href="/about" className={getLinkClassName("/about")}>
              {t("navbar.about")}
            </Link>
            <Link href="/#study-rooms" className={getLinkClassName("/#study-rooms")}>
              {t("navbar.study_rooms")}
            </Link>

            {showHomework && (
                <Link href="/homework" className={getLinkClassName("/homework")}>
                  {t("navbar.homework")}
                </Link>
            )}

            {showWorkstation && (
                <Link href="/workstation" className={getLinkClassName("/workstation")}>
                  {t("navbar.workstation")}
                </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
                className="md:hidden text-foreground focus:outline-none text-2xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* MENU MOBILE */}
        {isMobileMenuOpen && (
            <div className="pointer-events-auto absolute top-[85px] w-[90%] max-w-[400px] rounded-2xl bg-background/95 border border-foreground/10 backdrop-blur-xl p-6 flex flex-col items-center text-foreground shadow-2xl animate-in slide-in-from-top-5">
              <Link href="/about" className="py-3 w-full text-center hover:bg-foreground/5 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                {t("navbar.about")}
              </Link>
              <Link href="/#study-rooms" className="py-3 w-full text-center hover:bg-foreground/5 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                {t("navbar.study_rooms")}
              </Link>

              {showHomework && (
                  <Link href="/homework" className={`py-3 w-full text-center rounded-lg ${isActive("/homework") ? "text-cyan-500 font-bold" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                    {t("navbar.homework")}
                  </Link>
              )}

              {showWorkstation && (
                  <Link href="/workstation" className={`py-3 w-full text-center rounded-lg ${isActive("/workstation") ? "text-cyan-500 font-bold" : ""}`} onClick={() => setIsMobileMenuOpen(false)}>
                    {t("navbar.workstation")}
                  </Link>
              )}
            </div>
        )}
      </div>
  );
};

export const Navbar = dynamic(() => Promise.resolve(NavbarComponent), { ssr: false });