"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  ArrowLeftIcon,
  WalletIcon,
  IdentificationIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  CpuChipIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  LockClosedIcon // Novo ícone para indicar travamento
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { signIn, signOut, useSession } from "next-auth/react";
import GameHint from "@/src/components/ui/game-hint";

// Importações internas
import { slideInFromLeft } from "@/lib/motion";
import onboardPng from "@/app/onboard.png";

// --- TYPES & CONSTANTS ---

type MenuItem = { labelKey: string; href: string };

const MENU_ITEMS: MenuItem[] = [
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

type Role = typeof ROLES[number]["slug"];

// --- ONBOARDING MODAL COMPONENT (EDITADO) ---

function OnboardModal({ open, onClose, role, onSuccess }: { open: boolean; onClose: () => void; role: Role; onSuccess: (data: any) => void }) {
  const { t } = useTranslation();
  
  // States do Formulário (Travados visualmente)
  const [idValue, setIdValue] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(0); // Mantemos o step em 0 para mostrar o form inicial
  const [useWallet, setUseWallet] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // States do Código BETA (Lado Direito)
  const [betaCode, setBetaCode] = useState("");
  const [betaError, setBetaError] = useState(false);

  const idRef = useRef<HTMLInputElement | null>(null);
  
  const roleObj = ROLES.find((r) => r.slug === role);
  const roleLabel = roleObj ? t(roleObj.key) : role;

  const getRequirements = () => {
    if (useWallet) {
      return { label: t("modal.wallet_label"), placeholder: t("modal.wallet_placeholder") };
    }
    switch (role) {
      case "student": return { label: t("modal.lbl_student"), placeholder: t("modal.ph_student") };
      case "researcher": return { label: t("modal.lbl_researcher"), placeholder: t("modal.ph_researcher") };
      case "professional": return { label: t("modal.lbl_professional"), placeholder: t("modal.ph_professional") };
      case "entrepreneur": return { label: t("modal.lbl_entrepreneur"), placeholder: t("modal.ph_entrepreneur") };
      default: return { label: "ID", placeholder: "..." };
    }
  };

  const req = getRequirements();

  const steps = [
    { key: "id", label: req.label, placeholder: req.placeholder, type: "text" as const },
    { key: "name", label: t("modal.name"), placeholder: "Your Name", type: "text" as const },
    { key: "email", label: t("modal.email"), placeholder: "you@email.com", type: "email" as const },
    { key: "phone", label: t("modal.phone"), placeholder: "(00) 00000-0000", type: "text" as const },
    { key: "docs", label: t("modal.docs_label"), placeholder: t("modal.pdf_placeholder"), type: "file" as const },
  ] as const;

  // Limpa estados ao abrir
  useEffect(() => {
    if (open) {
      setIdValue(""); setFullName(""); setEmail(""); setPhone(""); setUploadedFiles([]); 
      setBetaCode(""); setBetaError(false);
    }
  }, [open]);

  // Função para salvar cookie (mantida da lógica original)
  const saveIntentToCookie = () => {
    const data = JSON.stringify({ role, phone, idValue, idType: useWallet ? 'wallet' : 'role_id' });
    document.cookie = `zaeon_intent=${encodeURIComponent(data)}; path=/; max-age=600`;
  };

  // Login Google Real
  const handleGoogleQuickStart = () => {
    saveIntentToCookie();
    let targetPath = "/";
    if (role === "student" || role === "researcher") {
      targetPath = "/homework";
    } else if (role === "professional" || role === "entrepreneur") {
      targetPath = "/workstation";
    }
    signIn('google', { callbackUrl: targetPath }, { prompt: "select_account" });
  };

  // Validação do Código Beta
  const handleBetaSubmit = () => {
    // Lógica simples: Se não for um código específico, dá erro
    if (betaCode !== "ZAEON-ALPHA-KEY") {
      setBetaError(true);
      // Remove o erro após animação
      setTimeout(() => setBetaError(false), 500);
    } else {
      // Se acertasse o código, aqui liberaria os inputs (não implementado pois o foco é travar)
      alert("Code Accepted. Welcome to Beta.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.code === "Escape") { e.preventDefault(); onClose(); return; }
  };

  if (!open) return null;

  // Estilo dos inputs travados
  const inputClass = "h-10 rounded-lg border border-white/5 bg-black/40 px-3 text-white/30 placeholder:text-white/10 outline-none w-full cursor-not-allowed";

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative w-full max-w-[900px] rounded-2xl border border-white/10 bg-[#0b121f] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Barra de progresso topo (decorativa) */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)]/50" />
          
          <button onClick={onClose} className="absolute right-3 top-3 z-50 rounded-md p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] min-h-[500px]">
            
            {/* LADO ESQUERDO: FORMULÁRIO TRAVADO */}
            <div className="p-8 space-y-5 relative">
              {/* Overlay suave para indicar inatividade */}
              <div className="absolute inset-0 z-10 bg-black/10 pointer-events-none" />

              <div className="flex items-center gap-2 mb-6 opacity-50">
                <LockClosedIcon className="w-4 h-4 text-white/60" />
                <p className="text-xs font-bold text-white/60 tracking-widest uppercase">Registration Locked</p>
              </div>

              <div className="space-y-4 opacity-60 grayscale-[0.5] pointer-events-none select-none">
                {steps.map((s, i) => (
                    <div key={s.key} className="grid grid-cols-[120px_1fr] items-center gap-4">
                      <p className="text-[12px] text-white/50 font-semibold text-right">{s.label}</p>
                      <div className="relative w-full">
                        {s.key === 'docs' ? (
                            <div className="h-10 w-full rounded-lg border border-dashed border-white/10 bg-black/20 flex items-center px-3">
                              <DocumentArrowUpIcon className="w-4 h-4 mr-2 text-white/20" />
                              <span className="text-xs text-white/20">{t("modal.upload_placeholder")}</span>
                            </div>
                        ) : (
                            <input 
                              disabled 
                              className={inputClass} 
                              placeholder={s.placeholder} 
                              type={s.type} 
                              value={s.key === "id" ? idValue : s.key === "name" ? fullName : s.key === "email" ? email : phone} 
                            />
                        )}
                      </div>
                    </div>
                ))}
              </div>
              
              <div className="absolute bottom-6 left-8 right-8">
                 <button disabled className="w-full h-10 rounded-xl bg-white/5 text-white/20 text-sm font-semibold cursor-not-allowed border border-white/5">
                    Awaiting Access Code...
                 </button>
              </div>
            </div>

            {/* LADO DIREITO: MENSAGEM & BETA CODE */}
            <div className="relative bg-[linear-gradient(160deg,rgba(15,23,42,0.6),rgba(30,41,59,0.8))] border-l border-white/5 p-8 flex flex-col justify-center items-center text-center">
              
              {/* Noise Texture */}
              <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />

              <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-[280px]">
                
                {/* Flag de Atenção */}
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                  <ExclamationTriangleIcon className="w-7 h-7 text-yellow-500" />
                </div>

                {/* Mensagem Corrigida */}
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-lg tracking-tight">Early Access</h3>
                  <p className="text-[12px] leading-relaxed text-slate-300 font-medium">
                    Zaeon is currently available for <strong className="text-yellow-400">BETA testers ONLY</strong>. 
                    Enter the code you received to access full features and flagship models, or log in to your Google account to access as a guest. Guests have access to a limited version of our project.
                  </p>
                </div>
                
                <Link href="/help-online" className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity">
                   Want to help us go online? Look here.
                </Link>

                <div className="w-full h-px bg-white/10 my-1" />

                {/* Input Código Beta */}
                <div className="w-full space-y-2">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Access Code</label>
                  <motion.div
                     animate={betaError ? { x: [-5, 5, -5, 5, 0] } : {}}
                     transition={{ duration: 0.4 }}
                  >
                    <div className="relative flex items-center">
                      <input 
                        value={betaCode}
                        onChange={(e) => { setBetaCode(e.target.value); setBetaError(false); }}
                        onKeyDown={(e) => e.key === "Enter" && handleBetaSubmit()}
                        placeholder="XXXX-XXXX"
                        className={`w-full h-10 rounded-xl bg-black/40 text-center text-white text-sm font-mono tracking-widest outline-none border transition-all placeholder:text-white/10 ${betaError ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] focus:border-red-500" : "border-white/10 focus:border-cyan-400/50"}`}
                      />
                      <button onClick={handleBetaSubmit} className="absolute right-1 top-1 bottom-1 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-colors">
                        <ChevronRightIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center gap-3 w-full opacity-60">
                   <div className="h-px bg-white/20 flex-1" />
                   <span className="text-[10px] uppercase text-white">OR</span>
                   <div className="h-px bg-white/20 flex-1" />
                </div>

                {/* Botão Google Redondo (Rota Real) */}
                <button 
                  onClick={handleGoogleQuickStart}
                  className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white text-black hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"
                  title="Sign in with Google (Limited Version)"
                >
                  <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={24} height={24} className="w-6 h-6" />
                </button>

              </div>
            </div>

          </div>
        </motion.div>
      </div>
  );
}

// --- CONSTANTES DE ESTILO (BLUE CYBER GLASS) ---

const panel = [
  "relative z-20 w-full max-w-[480px] mt-24 rounded-3xl overflow-hidden transition-all duration-500",
  "backdrop-blur-xl",
  "bg-black/60 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
  "dark:bg-cyan-900/20 dark:border-cyan-400/30 dark:shadow-[0_0_60px_rgba(34,211,238,0.15)]",
  "after:pointer-events-none after:absolute after:inset-0 after:opacity-[0.1] after:bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
].join(" ");

const cardBase = [
  "group relative overflow-hidden flex items-center justify-between rounded-xl px-5 min-h-[64px]",
  "transition-all duration-300 ease-out cursor-pointer",
  "font-bold tracking-wide",
  "text-white",
  "bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/20",
  "dark:bg-cyan-950/30 dark:hover:bg-cyan-900/50 dark:border-cyan-400/10 dark:hover:border-cyan-400/30",
  "hover:scale-[1.02] active:scale-[0.98] shadow-sm"
].join(" ");

const cardSelected = "ring-1 ring-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.02] bg-black/50 dark:bg-cyan-900/40";

const accentBar = (active: boolean) => [
  "absolute left-0 top-0 h-full w-[4px] rounded-l-xl transition-all duration-300",
  active 
    ? "bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] opacity-100" 
    : "bg-transparent w-[0px] opacity-0"
].join(" ");

// --- MAIN COMPONENT (RESTANTE DO CÓDIGO) ---

const HeroContentComponent = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession(); // update removido pois não estava sendo usado

  const [index, setIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [chosenRole, setChosenRole] = useState<Role>("student");
  const [showImage, setShowImage] = useState(true);
  const lastScrollY = useRef(0);

  // Estados de Menu
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Estados do Perfil Custom
  const [customName, setCustomName] = useState(session?.user?.name || "");
  
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isLoggedIn = status === "authenticated";
  const userRole = (session?.user as any)?.role || "Student";
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  useEffect(() => {
    if (session?.user?.name) setCustomName(session.user.name);
  }, [session]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowImage(false);
      } else {
        setShowImage(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleOnboardSuccess = (data: any) => {
    if (data.email === "donmartinezcaiudoceu@gmail.com") {
      router.push("/workstation");
      return;
    }
    if (data.role === "cyber_hall") {
      router.push("/study-rooms/tech");
      return;
    }
    const query = new URLSearchParams({
      role: data.role,
      name: data.name,
      verified: data.hasDocs ? "true" : "false"
    }).toString();
    if (data.role === "student" || data.role === "researcher") {
      router.push(`/homework?${query}`);
    } else {
      router.push(`/workstation?${query}`);
    }
  };

  const handleLoadGame = () => {
    signIn('google', { callbackUrl: '/' });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (onboardOpen || isProfileOpen) return;
      if (isOptionsOpen && e.code === "Escape") { setIsOptionsOpen(false); return; }
      if (isOptionsOpen) return;

      if (pickerOpen && !isLoggedIn) {
        if (["ArrowLeft", "KeyA"].includes(e.code)) { e.preventDefault(); setRoleIndex((r: number) => (r - 1 + ROLES.length) % ROLES.length); return; }
        if (["ArrowRight", "KeyD"].includes(e.code)) { e.preventDefault(); setRoleIndex((r: number) => (r + 1) % ROLES.length); return; }
        if (e.code === "Enter") { e.preventDefault(); const chosen = ROLES[roleIndex]; setChosenRole(chosen.slug); setOnboardOpen(true); return; }
        if (e.code === "Escape") { e.preventDefault(); setPickerOpen(false); return; }
        return;
      }

      if (["ArrowUp", "KeyW"].includes(e.code)) { e.preventDefault(); setIndex((i: number) => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length); return; }
      if (["ArrowDown", "KeyS"].includes(e.code)) { e.preventDefault(); setIndex((i: number) => (i + 1) % MENU_ITEMS.length); return; }
      if (e.code === "Enter") {
        const item = MENU_ITEMS[index];
        if (!item) return;

        if (item.labelKey === "menu.new") {
          e.preventDefault();
          if (!isLoggedIn) setPickerOpen(true);
          return;
        }
        if (item.labelKey === "menu.load") {
          e.preventDefault();
          if(!isLoggedIn) handleLoadGame();
          return;
        }
        if (item.labelKey === "menu.options") { setIsOptionsOpen(true); return; }
        if (item.labelKey === "menu.manual") {
          router.push('/workstation/admin');
          return;
        }
        window.location.assign(item.href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, pickerOpen, roleIndex, onboardOpen, isOptionsOpen, isProfileOpen, isLoggedIn, router]);

  const handleModalClose = () => { setOnboardOpen(false); setPickerOpen(false); };

  const labelClass = "text-[16px] font-medium tracking-[0.01em]";

  const renderNewAccountItem = (selected: boolean) => {
    if (isLoggedIn) {
      return (
          <li>
            <div className={`${cardBase} ${selected ? cardSelected : ""} cursor-default border border-cyan-400/30 bg-cyan-900/10 dark:bg-cyan-900/20`} onMouseEnter={() => setIndex(0)}>
              <div className={accentBar(selected)} />
              <span className="text-[16px] font-bold tracking-[0.01em] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                 {displayRole} Lv.1
              </span>
              <CheckBadgeIcon className="h-6 w-6 text-cyan-400" />
            </div>
          </li>
      );
    }
    return (
        <li>
          <button type="button" className={`${cardBase} ${selected ? cardSelected : ""} pr-3 w-full`} onMouseEnter={() => setIndex(0)} onClick={() => setPickerOpen(true)}>
            <div className={accentBar(selected)} />
            <span className={labelClass}>{t("menu.new")}</span>
            <div className="flex items-center gap-2 sm:gap-3">
              {!pickerOpen ? ( <ChevronRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" /> ) : (
                  <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setRoleIndex((r) => (r - 1 + ROLES.length) % ROLES.length); }} className="rounded-md p-1.5 hover:bg-white/10"><ChevronLeftIcon className="h-5 w-5" /></button>
                    <div onClick={(e) => { e.stopPropagation(); const chosen = ROLES[roleIndex]; setChosenRole(chosen.slug); setOnboardOpen(true); }} className="select-none px-5 py-2 rounded-xl text-[14px] font-bold text-white bg-black/85 border border-white/15 hover:scale-105 transition-transform">
                      {t(ROLES[roleIndex].key)}
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setRoleIndex((r) => (r + 1) % ROLES.length); }} className="rounded-md p-1.5 hover:bg-white/10"><ChevronRightIcon className="h-5 w-5" /></button>
                  </motion.div>
              )}
            </div>
          </button>
        </li>
    );
  };

  return (
      <div ref={containerRef} className="w-full min-h-screen flex justify-start items-start z-10 relative px-4 md:pl-20 py-12 overflow-hidden">
        
        {/* IMAGEM LATERAL */}
        <motion.div 
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: showImage ? 0 : "100%", opacity: showImage ? 1 : 0 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          className="absolute -right-80 top-20 bottom-0 w-[85vw] max-w-none pointer-events-none z-0 hidden lg:block overflow-hidden"
        >
          <Image 
            src="/assets/computer.png" 
            alt="Workstation Image" 
            fill
            className="object-right object-top object-contain opacity-95 transition-opacity duration-500"
            priority
          />
        </motion.div>

        <div className="flex flex-col items-start z-20">
          <motion.aside 
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: showImage ? 0 : "-100%", opacity: showImage ? 1 : 0 }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className={panel}
          >
            <div className="flex items-center gap-3 px-6 pt-7 pb-4">
              <p className="text-sm text-white/85 tracking-[0.05em]">{t("footer.powered")}</p>
            </div>

            <nav className="px-4 sm:px-6 pb-6 relative min-h-[300px]">
              <AnimatePresence mode="wait" initial={false}>
                {!isOptionsOpen ? (
                    <motion.ul key="main-menu" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3">
                      {renderNewAccountItem(index === 0)}
                      {MENU_ITEMS.slice(1).map((item, i) => {
                        const realIndex = i + 1;
                        const selected = realIndex === index;
                        const isOptions = item.labelKey === "menu.options";
                        const isLoad = item.labelKey === "menu.load";
                        const isManual = item.labelKey === "menu.manual";

                        if (isLoad) {
                          if (isLoggedIn) {
                            return (
                                <li key={item.labelKey}>
                                  <div className={`${cardBase} ${selected ? cardSelected : ""} cursor-default`} onMouseEnter={() => setIndex(realIndex)}>
                                    <div className={accentBar(selected)} />
                                    <div className="flex flex-col justify-center">
                                      <span className="text-[10px] opacity-60 uppercase tracking-widest font-bold mb-0.5">{t("menu.connected_as")}</span>
                                      <span className="text-[13px] font-medium truncate max-w-[200px]">{session?.user?.email}</span>
                                    </div>
                                    <Image src="https://authjs.dev/img/providers/google.svg" alt="G" width={20} height={20} className="w-5 h-5 opacity-80" />
                                  </div>
                                </li>
                            )
                          }
                          return (
                              <li key={item.labelKey}>
                                <button onClick={handleLoadGame} className={`${cardBase} ${selected ? cardSelected : ""} w-full`} onMouseEnter={() => setIndex(realIndex)}>
                                  <div className={accentBar(selected)} />
                                  <div className="flex items-center gap-3">
                                    <span className={labelClass}>{t(item.labelKey)}</span>
                                    {selected && <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded ml-2">{t("menu.google_save")}</span>}
                                  </div>
                                  <ChevronRightIcon className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                                </button>
                              </li>
                          )
                        }

                        if (isManual) {
                          return (
                              <li key={item.labelKey}>
                                <Link href="/workstation/admin" className={`${cardBase} ${selected ? cardSelected : ""}`} onMouseEnter={() => setIndex(realIndex)}>
                                  <div className={accentBar(selected)} />
                                  <div className="flex items-center gap-2">
                                    <span className={labelClass}>{t(item.labelKey)}</span>
                                  </div>
                                  <CpuChipIcon className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                                </Link>
                              </li>
                          )
                        }

                        if (isOptions) {
                          return (
                              <li key={item.labelKey}>
                                <button onClick={() => setIsOptionsOpen(true)} className={`${cardBase} ${selected ? cardSelected : ""} w-full`} onMouseEnter={() => setIndex(realIndex)}>
                                  <div className={accentBar(selected)} />
                                  <span className={labelClass}>{t(item.labelKey)}</span>
                                  <ChevronRightIcon className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                                </button>
                              </li>
                          );
                        }
                        return null;
                      })}
                    </motion.ul>
                ) : !isProfileOpen ? (
                    <motion.div key="options-menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
                      <div className="flex items-center mb-1">
                        <button onClick={() => setIsOptionsOpen(false)} className="flex items-center gap-2 text-sm font-bold transition-colors text-blue-500 hover:text-blue-400 dark:text-cyan-400 dark:hover:text-cyan-300">
                          <ArrowLeftIcon className="w-4 h-4" />
                          <span className="uppercase tracking-wider text-[11px]">{t("menu.back")}</span>
                        </button>
                      </div>
                      <div className={`${cardBase} py-2`}>
                        <div className="flex flex-col">
                          <span className="text-[13px] opacity-60 font-medium uppercase tracking-wider mb-1">{t("options.language")}</span>
                          <span className="text-[15px] font-semibold">
                            {i18n.language === 'en' ? 'English' : i18n.language === 'zh' ? '中文' : i18n.language === 'ko' ? '한국어' : i18n.language === 'fr' ? 'Français' : i18n.language === 'pt' ? 'Português' : 'Español'}
                          </span>
                        </div>
                        <select className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={i18n.language} onChange={handleLanguageChange}>
                          <option value="en">English</option>
                          <option value="pt">Português</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="zh">中文</option>
                          <option value="ko">한국어</option>
                        </select>
                        <ChevronRightIcon className="h-5 w-5 opacity-40" />
                      </div>
                      <div className={`${cardBase} py-2 cursor-pointer`} onClick={() => setIsProfileOpen(true)}>
                        <div className="flex flex-col">
                          <span className="text-[13px] opacity-60 font-medium uppercase tracking-wider mb-1">{t("menu.identity")}</span>
                          <span className="text-[15px] font-semibold">{t("menu.custom_profile")}</span>
                        </div>
                        <UserCircleIcon className="h-6 w-6 opacity-40" />
                      </div>
                      <div className={`${cardBase} py-2 cursor-pointer group hover:bg-red-500/10 hover:border-red-500/30 transition-all`} onClick={() => signOut({ callbackUrl: "/" })}>
                        <div className="flex flex-col">
                          <span className="text-[13px] opacity-60 group-hover:text-red-500 font-medium uppercase tracking-wider mb-1">Session Control</span>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
                            <span className="text-[15px] font-semibold group-hover:text-red-500">Disconnect (Logout)</span>
                          </div>
                        </div>
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5 opacity-40 group-hover:text-red-500" />
                      </div>
                    </motion.div>
                ) : (
                    <motion.div key="profile-menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
                       <div className="flex items-center mb-1">
                        <button onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 text-sm font-bold transition-colors text-blue-500 hover:text-blue-400 dark:text-cyan-400 dark:hover:text-cyan-300">
                          <ArrowLeftIcon className="w-4 h-4" />
                          <span className="uppercase tracking-wider text-[11px]">{t("menu.back")}</span>
                        </button>
                      </div>
                      <div className="p-4 text-center opacity-50 text-white">
                        Profile Settings (Content here)
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </nav>
            <div className="px-6 pb-7 text-[11px] opacity-55 tracking-wide text-white">{t("footer.version")}</div>
          </motion.aside>

          <motion.div
            className="mt-4 w-full"
            animate={{ x: showImage ? 0 : "-120%", opacity: showImage ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          >
            <GameHint 
              isVisible={showImage} 
              hints={[
                t("hints.new_game", "DICA: Inicie com um perfil novo para conferir a tecnolgia da Zaeon."),
                t("hints.save_progress", "DICA: Conecte sua conta Google para salvar seu progresso e conquistas."),
                t("hints.roles", "DICA: Cada classe (Estudante, Pesquisador) libera ferramentas exclusivas no sistema."),
                t("hints.wallet", "DICA: Carregue seu progresso salvo para continuar sua jornada."),
                t("hints.options", "DICA: Acesse as opções para personalizar seu perfil e configurações.")
              ]} 
            />
          </motion.div>
        </div>

        <OnboardModal open={onboardOpen} onClose={handleModalClose} role={chosenRole} onSuccess={handleOnboardSuccess} />
      </div>
  );
};

export default dynamic(() => Promise.resolve(HeroContentComponent), { ssr: false });