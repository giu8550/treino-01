"use client";
import React, { useState, useEffect } from "react";
import { 
  ChevronRightIcon, ChevronLeftIcon, ArrowLeftIcon, 
  CheckBadgeIcon, CpuChipIcon, UserCircleIcon, 
  ArrowRightStartOnRectangleIcon, LockClosedIcon 
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const OnboardModal = dynamic(() => import("@/components/main/OnboardModal"), { ssr: false });

const MENU_ITEMS = [
  { labelKey: "menu.new", href: "/signup" },
  { labelKey: "menu.load", href: "#" },
  { labelKey: "menu.options", href: "/settings" },
  { labelKey: "menu.manual", href: "/workstation/admin" },
];

const ROLES = [
  { slug: "student", key: "roles.student" },
  { slug: "researcher", key: "roles.researcher" },
  { slug: "professional", key: "roles.professional" },
  { slug: "entrepreneur", key: "roles.entrepreneur" },
  { slug: "cyber_hall", key: "Hall Cibernético" },
] as const;

// --- CONSTANTES DE ESTILO (RECUPERADAS DO ORIGINAL) ---

const panelClass = `
  relative z-20 w-full max-w-[480px] mt-24 rounded-3xl overflow-hidden backdrop-blur-xl 
  transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)]
  bg-black/60 border border-white/10 
  dark:bg-cyan-900/20 dark:border-cyan-400/30 dark:shadow-[0_0_60px_rgba(34,211,238,0.15)]
  after:pointer-events-none after:absolute after:inset-0 after:opacity-[0.1] 
  after:bg-[url('https://grainy-gradients.vercel.app/noise.svg')]
`;

const cardBase = `
  group relative overflow-hidden flex items-center justify-between rounded-xl px-5 min-h-[64px]
  transition-all duration-300 ease-out cursor-pointer font-bold tracking-wide text-white
  bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/20
  dark:bg-cyan-950/30 dark:hover:bg-cyan-900/50 dark:border-cyan-400/10 dark:hover:border-cyan-400/30
  hover:scale-[1.02] active:scale-[0.98]
`;

const cardSelected = "ring-1 ring-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02] bg-black/50 dark:bg-cyan-900/40";

const accentBar = (active: boolean) => `
  absolute left-0 top-0 h-full w-[4px] rounded-l-xl transition-all duration-300
  ${active ? "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] opacity-100" : "bg-transparent w-[0px] opacity-0"}
`;

export default function MenuNavigation() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [index, setIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isLoggedIn = status === "authenticated";
  const userRole = (session?.user as any)?.role || "Student";
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <motion.aside 
      initial={{ x: "-100%", opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
      className={panelClass}
    >
      <div className="flex items-center gap-3 px-6 pt-7 pb-4">
        <p className="text-sm text-white/85 tracking-[0.05em]">{t("footer.powered")}</p>
      </div>

      <nav className="px-4 sm:px-6 pb-6 relative min-h-[350px]">
        <AnimatePresence mode="wait" initial={false}>
          
          {/* MENU PRINCIPAL */}
          {!isOptionsOpen ? (
            <motion.ul 
              key="main-menu" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="flex flex-col gap-3"
            >
              {/* ITEM: NOVO JOGO / ROLE PICKER */}
              <li onMouseEnter={() => setIndex(0)} onClick={() => !isLoggedIn && setPickerOpen(true)}>
                <div className={`${cardBase} ${index === 0 ? cardSelected : ""}`}>
                  <div className={accentBar(index === 0)} />
                  <span className="text-[16px] font-bold">
                    {isLoggedIn ? `${displayRole} Lv.1` : t("menu.new")}
                  </span>
                  {isLoggedIn ? (
                    <CheckBadgeIcon className="h-6 w-6 text-cyan-400" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {pickerOpen ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-black/60 p-1 rounded-lg border border-white/10">
                          <ChevronLeftIcon className="w-5 h-5 cursor-pointer hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); setRoleIndex(r => (r - 1 + ROLES.length) % ROLES.length); }} />
                          <span className="text-xs px-2 min-w-[100px] text-center" onClick={(e) => { e.stopPropagation(); setOnboardOpen(true); }}>{t(ROLES[roleIndex].key)}</span>
                          <ChevronRightIcon className="w-5 h-5 cursor-pointer hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); setRoleIndex(r => (r + 1) % ROLES.length); }} />
                        </motion.div>
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  )}
                </div>
              </li>

              {/* MAPEAMENTO DOS OUTROS ITENS */}
              {MENU_ITEMS.slice(1).map((item, i) => {
                const realIndex = i + 1;
                const isSelected = index === realIndex;
                const isLoad = item.labelKey === "menu.load";

                return (
                  <li 
                    key={item.labelKey} 
                    onMouseEnter={() => setIndex(realIndex)}
                    onClick={() => {
                      if (item.labelKey === "menu.options") setIsOptionsOpen(true);
                      else if (isLoad && !isLoggedIn) signIn('google');
                      else router.push(item.href);
                    }}
                  >
                    <div className={`${cardBase} ${isSelected ? cardSelected : ""}`}>
                      <div className={accentBar(isSelected)} />
                      <div className="flex flex-col">
                        <span className="text-[16px] font-medium">{t(item.labelKey)}</span>
                        {isLoad && isLoggedIn && <span className="text-[10px] opacity-50">{session?.user?.email}</span>}
                      </div>
                      <ChevronRightIcon className="h-5 w-5 opacity-40 group-hover:opacity-100" />
                    </div>
                  </li>
                );
              })}
            </motion.ul>
          ) : !isProfileOpen ? (
            
            /* MENU DE OPÇÕES (RESTAURADO) */
            <motion.div key="options-menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
              <button onClick={() => setIsOptionsOpen(false)} className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-2">
                <ArrowLeftIcon className="w-4 h-4" /> {t("menu.back")}
              </button>

              {/* SELETOR DE IDIOMA */}
              <div className={`${cardBase} py-2`}>
                <div className="flex flex-col">
                  <span className="text-[12px] opacity-60 uppercase tracking-wider mb-1">{t("options.language")}</span>
                  <span className="text-[15px]">{i18n.language.toUpperCase()}</span>
                </div>
                <select className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={i18n.language} onChange={handleLanguageChange}>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="es">Español</option>
                </select>
                <ChevronRightIcon className="h-5 w-5 opacity-40" />
              </div>

              {/* PERFIL */}
              <div className={cardBase} onClick={() => setIsProfileOpen(true)}>
                <div className="flex flex-col">
                  <span className="text-[12px] opacity-60 uppercase tracking-wider mb-1">{t("menu.identity")}</span>
                  <span className="text-[15px]">{t("menu.custom_profile")}</span>
                </div>
                <UserCircleIcon className="h-6 w-6 opacity-40" />
              </div>

              {/* LOGOUT */}
              <div className={`${cardBase} group hover:bg-red-500/10 hover:border-red-500/30 transition-all`} onClick={() => signOut({ callbackUrl: "/" })}>
                <div className="flex flex-col">
                  <span className="text-[12px] opacity-60 group-hover:text-red-500 uppercase tracking-wider mb-1">Session</span>
                  <span className="text-[15px] group-hover:text-red-500">Disconnect</span>
                </div>
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 opacity-40 group-hover:text-red-500" />
              </div>
            </motion.div>
          ) : (
            
            /* MENU DE PERFIL */
            <motion.div key="profile-menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
              <button onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-2">
                <ArrowLeftIcon className="w-4 h-4" /> {t("menu.back")}
              </button>
              <div className="p-8 text-center text-white/40 border border-white/5 rounded-xl bg-black/20">
                {t("menu.profile_content_placeholder", "Profile Settings Interface")}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="px-6 pb-7 text-[11px] opacity-55 text-white tracking-widest">{t("footer.version")}</div>

      {onboardOpen && (
        <OnboardModal 
          open={onboardOpen} 
          onClose={() => setOnboardOpen(false)} 
          role={ROLES[roleIndex].slug} 
          onSuccess={() => {}} 
        />
      )}
    </motion.aside>
  );
}