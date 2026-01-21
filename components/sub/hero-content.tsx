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
  CameraIcon,
  AcademicCapIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ArrowRightStartOnRectangleIcon // Ícone de Logout
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { signIn, signOut, useSession } from "next-auth/react"; // Adicionado signOut

// Importações internas (Ajuste se necessário para o seu caminho real)
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

// --- ONBOARDING MODAL COMPONENT ---

function OnboardModal({ open, onClose, role, onSuccess }: { open: boolean; onClose: () => void; role: Role; onSuccess: (data: any) => void }) {
  const { t } = useTranslation();
  const [idValue, setIdValue] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const idRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Definindo steps dentro do componente para usar o 't'
  const steps = [
    { key: "id", label: req.label, placeholder: req.placeholder, type: "text" as const },
    { key: "name", label: t("modal.name"), placeholder: "", type: "text" as const },
    { key: "email", label: t("modal.email"), placeholder: "you@email.com", type: "email" as const },
    { key: "phone", label: t("modal.phone"), placeholder: "(00) 00000-0000", type: "text" as const },
    { key: "docs", label: t("modal.docs_label"), placeholder: t("modal.pdf_placeholder"), type: "file" as const },
  ] as const;

  const lastIndex = steps.length - 1;

  const validate = (idx: number) => {
    const key = steps[idx]?.key;
    if (!key) return false;
    if (key === "id") return useWallet ? idValue.trim().length > 20 : idValue.trim().length > 3;
    if (key === "name") return fullName.trim().length > 2;
    if (key === "email") return /\S+@\S+\.\S+/.test(email);
    if (key === "phone") return phone.trim().replace(/\D/g, "").length >= 10;
    if (key === "docs") return true;
    return false;
  };

  const canSubmit = steps.every((_, i) => validate(i));

  useEffect(() => {
    if (open) {
      setIdValue(""); setFullName(""); setEmail(""); setPhone(""); setUploadedFiles([]); setStep(0); setUseWallet(false);
      const t = setTimeout(() => idRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const key = steps[step]?.key;
      if (key === "id") idRef.current?.focus();
      if (key === "name") nameRef.current?.focus();
      if (key === "email") emailRef.current?.focus();
      if (key === "phone") phoneRef.current?.focus();
    }, 10);
    return () => clearTimeout(t);
  }, [step, open]);

  const saveIntentToCookie = () => {
    const data = JSON.stringify({ role, phone, idValue, idType: useWallet ? 'wallet' : 'role_id' });
    document.cookie = `zaeon_intent=${encodeURIComponent(data)}; path=/; max-age=600`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", idValue);

      try {
        console.log("Arquivo preparado para envio:", file.name);
      } catch (error) {
        console.error("Erro upload:", error);
      }
    }

    saveIntentToCookie();
    onSuccess({ role, id: idValue, idType: useWallet ? 'wallet' : 'role_id', name: fullName, email, phone, hasDocs: uploadedFiles.length > 0 });
    onClose();
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.code === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.code === "Enter") {
      e.preventDefault();
      if (steps[step].key === 'docs' && uploadedFiles.length === 0) {
        if (step < lastIndex) setStep(s => s + 1);
        else handleSubmit();
        return;
      }
      if (!validate(step)) return;
      if (step < lastIndex) setStep((s) => Math.min(lastIndex, s + 1));
      else handleSubmit();
    }
  };

  if (!open) return null;

  const inputClass = "h-10 rounded-lg border border-white/10 bg-black/70 px-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-400/60 w-full";

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-[960px] rounded-2xl border border-white/10 bg-[rgba(7,16,28,0.85)] shadow-[0_10px_50px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)]/80 animate-pulse" />
          <button onClick={onClose} className="absolute right-3 top-3 rounded-md p-2 text-white/70 hover:bg-white/10"><XMarkIcon className="h-5 w-5" /></button>
          <div className="grid grid-cols-[1.3fr_0.7fr]">
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-sm text-white/85 tracking-wide">{t("modal.title")} · {roleLabel}</p>
              </div>

              <div className="mb-4">
                <button
                    onClick={handleGoogleQuickStart}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                  <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
                  {t("login.google") || "Sign in with Google"}
                </button>
                <div className="flex items-center gap-2 mt-3 mb-2 opacity-50">
                  <div className="h-px bg-white/30 flex-1"></div>
                  <span className="text-[10px] uppercase text-white">{t("modal.or_manual")}</span>
                  <div className="h-px bg-white/30 flex-1"></div>
                </div>
              </div>

              {steps.map((s, i) => {
                const active = i === step;
                return (
                    <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-[220px_1fr] items-center gap-3">
                      <div className={["rounded-lg px-3 py-2 border w-full flex items-center justify-between transition-colors", active ? "border-cyan-300/50 bg-[linear-gradient(120deg,rgba(34,211,238,.18),rgba(139,92,246,.18))] shadow-[0_0_22px_rgba(34,211,238,0.25)]" : "border-white/10 bg-white/[0.06]"].join(" ")}>
                        <p className="text-[12px] text-white font-semibold">{s.label}</p>
                        {s.key === 'id' && (
                            <button onClick={() => { setUseWallet(!useWallet); setIdValue(""); idRef.current?.focus(); }} className="ml-2 text-[10px] uppercase font-bold tracking-wide text-cyan-400 hover:text-cyan-200 flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                              {useWallet ? ( <><IdentificationIcon className="w-3 h-3" /> {t("modal.use_id")}</> ) : ( <><WalletIcon className="w-3 h-3" /> {t("modal.use_wallet")}</> )}
                            </button>
                        )}
                      </div>

                      <div className="relative w-full">
                        {s.key === 'docs' ? (
                            <div className="flex flex-col gap-2">
                              <div onClick={() => fileInputRef.current?.click()} className={`h-10 w-full rounded-lg border border-dashed flex items-center px-3 cursor-pointer transition-all ${uploadedFiles.length > 0 ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 bg-black/40 hover:bg-white/5'}`}>
                                <DocumentArrowUpIcon className={`w-4 h-4 mr-2 ${uploadedFiles.length > 0 ? 'text-green-400' : 'text-white/60'}`} />
                                <span className={`text-xs truncate ${uploadedFiles.length > 0 ? 'text-green-400' : 'text-white/60'}`}>
                                          {uploadedFiles.length > 0 ? uploadedFiles[0].name : t("modal.upload_placeholder")}
                                      </span>
                                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                              </div>
                              {uploadedFiles.length === 0 && active && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-lg mt-1">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-yellow-200/80 leading-tight">
                                      <strong>{t("modal.attention_title")}</strong> {t("modal.attention_desc")}
                                    </p>
                                  </motion.div>
                              )}
                            </div>
                        ) : (
                            <input ref={s.key === "id" ? idRef : s.key === "name" ? nameRef : s.key === "email" ? emailRef : phoneRef} className={inputClass} placeholder={s.placeholder} type={s.type} value={s.key === "id" ? idValue : s.key === "name" ? fullName : s.key === "email" ? email : phone} onChange={(e) => { const val = e.target.value; if (s.key === "id") setIdValue(val); if (s.key === "name") setFullName(val); if (s.key === "email") setEmail(val); if (s.key === "phone") setPhone(val); }} />
                        )}
                      </div>
                    </motion.div>
                );
              })}

              <div className="flex items-center gap-3 pt-3">
                <button
                    disabled={!validate(step) && step !== lastIndex}
                    onClick={step < lastIndex ? () => setStep(s => s + 1) : handleSubmit}
                    className={["rounded-xl px-5 h-10 text-sm font-semibold text-white", "bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)] hover:brightness-110", "shadow-[0_0_22px_rgba(56,189,248,0.38)] transition", (!validate(step) && step !== lastIndex) ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
                >
                  {step === lastIndex ? (uploadedFiles.length > 0 ? t("modal.finish") : t("modal.skip")) : t("modal.continue")}
                </button>
                <button onClick={onClose} className="rounded-xl px-5 h-10 text-sm font-semibold text-white/80 hover:text-white border border-white/15">{t("modal.cancel")}</button>
              </div>
            </div>
            <div className="relative flex justify-end pr-4 pt-2">
              <Image src={onboardPng} alt="Zaeon Onboard" className="w-[85%] max-w-[360px] h-auto object-contain translate-y-[-20px]" priority draggable={false} />
            </div>
          </div>
        </motion.div>
      </div>
  );
}

// --- MAIN HERO CONTENT COMPONENT ---

const HeroContentComponent = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [index, setIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [chosenRole, setChosenRole] = useState<Role>("student");
  const [showImage, setShowImage] = useState(true);
const lastScrollY = useRef(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      // Rolando para baixo -> Esconde a imagem
      setShowImage(false);
    } else {
      // Rolando para cima -> Mostra a imagem
      setShowImage(true);
    }
    lastScrollY.current = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // Estados de Menu
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tutorials, setTutorials] = useState(true);

  // Estados do Perfil Custom
  const [customName, setCustomName] = useState(session?.user?.name || "");
  const [customCourse, setCustomCourse] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(session?.user?.image || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const isLoggedIn = status === "authenticated";
  const userRole = (session?.user as any)?.role || "Student";
  const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  useEffect(() => {
    if (session?.user?.name) setCustomName(session.user.name);
    if (session?.user?.image) setAvatarPreview(session.user.image);
  }, [session]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!customName.trim()) return;
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append("name", customName);
    formData.append("course", customCourse);
    if (avatarFile) {
      formData.append("image", avatarFile);
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await update({
          name: customName,
          image: avatarPreview,
          course: customCourse
        });

        setIsSaved(true);

        setTimeout(() => {
          setIsSaved(false);
          setIsProfileOpen(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setIsSavingProfile(false);
    }
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

  // ALTERAÇÃO: Aumento da transparência no gradiente de fundo (alpha reduzido para 0.12/0.15)
  const panel = "relative z-20 w-full max-w-[480px] mt-24 rounded-2xl overflow-hidden backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.12)] bg-[linear-gradient(135deg,rgba(7,38,77,0.12),rgba(11,58,164,0.10),rgba(16,134,201,0.15),rgba(11,58,164,0.10),rgba(7,38,77,0.12))] bg-[length:400%_400%] animate-[gradientFlow_12s_ease-in-out_infinite] after:pointer-events-none after:absolute after:inset-0 after:bg-[repeating-linear-gradient(transparent_0px,transparent_8px,rgba(255,255,255,0.025)_9px,transparent_10px)] after:opacity-20";
  const cardBase = "group relative overflow-hidden flex items-center justify-between rounded-xl px-5 min-h-[64px] ring-1 ring-white/10 text-white transition-all duration-300 ease-out bg-[linear-gradient(120deg,rgba(3,22,45,0.55),rgba(6,42,90,0.55),rgba(7,60,120,0.55))] hover:bg-[linear-gradient(120deg,rgba(6,50,100,0.65),rgba(8,60,130,0.65))] hover:scale-[1.02] focus-visible:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_12px_rgba(34,211,238,0.12)]";
  const cardSelected = "ring-cyan-300/45 shadow-[0_0_28px_rgba(34,211,238,0.25)]";
  const accentBar = (active: boolean) => ["absolute left-0 top-0 h-full w-[3px] rounded-l-xl transition-colors", active ? "bg-[linear-gradient(180deg,#22d3ee,#60a5fa,#22d3ee)]" : "bg-white/10 group-hover:bg-[linear-gradient(180deg,rgba(34,211,238,.7),rgba(96,165,250,.7),rgba(34,211,238,.7))]",].join(" ");
  const labelClass = "text-[16px] font-medium tracking-[0.01em] text-white";

  // Render New Account Item (Mantido igual)
  const renderNewAccountItem = (selected: boolean) => {
    if (isLoggedIn) {
      return (
          <li>
            <div className={[cardBase, selected ? cardSelected : "", "cursor-default border border-green-500/30 bg-green-900/10"].join(" ")} onMouseEnter={() => setIndex(0)}>
              <span className={accentBar(selected)} />
              <span className="text-[16px] font-bold tracking-[0.01em] text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                 {displayRole} Lv.1
              </span>
              <CheckBadgeIcon className="h-6 w-6 text-green-400" />
            </div>
          </li>
      );
    }
    return (
        <li>
          <button type="button" className={[cardBase, selected ? cardSelected : "", "pr-3"].join(" ")} onMouseEnter={() => setIndex(0)} onClick={() => setPickerOpen(true)}>
            <span className={accentBar(selected)} />
            <span className={labelClass}>{t("menu.new")}</span>
            <div className="flex items-center gap-2 sm:gap-3">
              {!pickerOpen ? ( <ChevronRightIcon className="h-5 w-5 text-white/85 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" /> ) : (
                  <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setRoleIndex((r) => (r - 1 + ROLES.length) % ROLES.length); }} className="rounded-md p-1.5 hover:bg-white/10"><ChevronLeftIcon className="h-5 w-5 text-white/95" /></button>
                    <div onClick={(e) => { e.stopPropagation(); const chosen = ROLES[roleIndex]; setChosenRole(chosen.slug); setOnboardOpen(true); }} className="select-none px-5 py-2 rounded-xl text-[14px] font-bold text-white bg-black/85 border border-white/15 hover:scale-105 transition-transform">
                      {t(ROLES[roleIndex].key)}
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setRoleIndex((r) => (r + 1) % ROLES.length); }} className="rounded-md p-1.5 hover:bg-white/10"><ChevronRightIcon className="h-5 w-5 text-white/95" /></button>
                  </motion.div>
              )}
            </div>
          </button>
        </li>
    );
  };

  return (
      <div ref={containerRef} className="w-full min-h-screen flex justify-start items-start z-10 relative px-4 md:pl-20 py-12 overflow-hidden">
        
        {/* NOVA IMAGEM: assets/computer.png no canto direito */}
<motion.div 
  initial={{ x: 0, opacity: 1 }}
  animate={{ 
    x: showImage ? 0 : "100%", 
    opacity: showImage ? 1 : 0 
  }}
  transition={{ 
    duration: 1.5, 
    ease: [0.23, 1, 0.32, 1] 
  }}
  /* Aumentamos a largura para 85vw e ajustamos o top para evitar o corte */
  className="absolute -right-80 top-20 bottom-0 w-[85vw] max-w-none pointer-events-none z-0 hidden lg:block overflow-hidden"
>
  <Image 
    src="/assets/computer.png" 
    alt="Workstation Image" 
    fill
    /* object-top garante que a parte de cima (cabeça) apareça primeiro */
    className="object-right object-top object-contain opacity-95 transition-opacity duration-500"
    priority
  />
</motion.div>
        <motion.aside variants={slideInFromLeft(0.12)} initial="hidden" animate="visible" className={panel}>

          <div className="flex items-center gap-3 px-6 pt-7 pb-4">
            <p className="text-sm text-white/85 tracking-[0.05em]">{t("footer.powered")}</p>
          </div>

          <nav className="px-4 sm:px-6 pb-6 relative min-h-[300px]">
            <AnimatePresence mode="wait" initial={false}>

              {/* --- MENU PRINCIPAL --- */}
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
                                <div className={[cardBase, selected ? cardSelected : "", "cursor-default"].join(" ")} onMouseEnter={() => setIndex(realIndex)}>
                                  <span className={accentBar(selected)} />
                                  <div className="flex flex-col justify-center">
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-0.5">{t("menu.connected_as")}</span>
                                    <span className="text-[13px] font-medium text-white truncate max-w-[200px]">{session?.user?.email}</span>
                                  </div>
                                  <Image src="https://authjs.dev/img/providers/google.svg" alt="G" width={20} height={20} className="w-5 h-5 opacity-80" />
                                </div>
                              </li>
                          )
                        }
                        return (
                            <li key={item.labelKey}>
                              <button onClick={handleLoadGame} className={[cardBase, selected ? cardSelected : "", "w-full"].join(" ")} onMouseEnter={() => setIndex(realIndex)}>
                                <span className={accentBar(selected)} />
                                <div className="flex items-center gap-3">
                                  <span className={labelClass}>{t(item.labelKey)}</span>
                                  {selected && <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded ml-2">{t("menu.google_save")}</span>}
                                </div>
                                <ChevronRightIcon className="h-5 w-5 text-white/85 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                              </button>
                            </li>
                        )
                      }

                      if (isManual) {
                        return (
                            <li key={item.labelKey}>
                              <Link href="/workstation/admin" className={[cardBase, selected ? cardSelected : ""].join(" ")} onMouseEnter={() => setIndex(realIndex)}>
                                <span className={accentBar(selected)} />
                                <div className="flex items-center gap-2">
                                  <span className={labelClass}>{t(item.labelKey)}</span>
                                  <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{t("menu.dev_hack")}</span>
                                </div>
                                <CpuChipIcon className="h-5 w-5 text-white/85 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                              </Link>
                            </li>
                        )
                      }

                      if (isOptions) {
                        return (
                            <li key={item.labelKey}>
                              <button onClick={() => setIsOptionsOpen(true)} className={[cardBase, selected ? cardSelected : "", "w-full"].join(" ")} onMouseEnter={() => setIndex(realIndex)}>
                                <span className={accentBar(selected)} />
                                <span className={labelClass}>{t(item.labelKey)}</span>
                                <ChevronRightIcon className="h-5 w-5 text-white/85 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                              </button>
                            </li>
                        );
                      }
                      return null;
                    })}
                  </motion.ul>
              ) : !isProfileOpen ? (
                  // --- MENU DE OPÇÕES (NÍVEL 1) ---
                  <motion.div key="options-menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
                    <div className="flex items-center mb-1">
                      <button
                          onClick={() => setIsOptionsOpen(false)}
                          className="flex items-center gap-2 text-sm font-bold transition-colors text-blue-600 hover:text-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="uppercase tracking-wider text-[11px]">{t("menu.back")}</span>
                      </button>
                    </div>

                    <div className={`${cardBase} py-2`}>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-white/50 font-medium uppercase tracking-wider mb-1">{t("options.language")}</span>
                        <span className="text-[15px] font-semibold text-white">
                          {i18n.language === 'en' ? 'English' : i18n.language === 'zh' ? '中文 (Mandarin)' : i18n.language === 'ko' ? '한국어 (Korean)' : i18n.language === 'fr' ? 'Français' : i18n.language === 'pt' ? 'Português' : 'Español'}
                        </span>
                      </div>
                      <select className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" value={i18n.language} onChange={handleLanguageChange}>
                        <option className="bg-slate-900 text-white" value="en">English</option>
                        <option className="bg-slate-900 text-white" value="pt">Português (Brasil)</option>
                        <option className="bg-slate-900 text-white" value="es">Español</option>
                        <option className="bg-slate-900 text-white" value="fr">Français</option>
                        <option className="bg-slate-900 text-white" value="zh">中文</option>
                        <option className="bg-slate-900 text-white" value="ko">한국어 (Korean)</option>
                      </select>
                      <ChevronRightIcon className="h-5 w-5 text-white/40" />
                    </div>

                    {/* --- SUBSTITUIÇÃO: NODE -> CUSTOM PROFILE --- */}
                    <div className={`${cardBase} py-2 cursor-pointer`} onClick={() => setIsProfileOpen(true)}>
                      <div className="flex flex-col">
                        <span className="text-[13px] text-white/50 font-medium uppercase tracking-wider mb-1">{t("menu.identity")}</span>
                        <span className="text-[15px] font-semibold text-white">{t("menu.custom_profile")}</span>
                      </div>
                      <UserCircleIcon className="h-6 w-6 text-white/40" />
                    </div>

                    {/* --- SUBSTITUIÇÃO: TUTORIALS -> LOGOUT --- */}
                    <div
                        className={`${cardBase} py-2 cursor-pointer group hover:bg-red-500/10 hover:border-red-500/30 transition-all`}
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <div className="flex flex-col">
                        <span className="text-[13px] text-white/50 group-hover:text-red-300/70 font-medium uppercase tracking-wider mb-1">
                            Session Control
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
                          <span className="text-[15px] font-semibold text-white group-hover:text-red-400">
                              Disconnect (Logout)
                          </span>
                        </div>
                      </div>
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-white/40 group-hover:text-red-400 transition-transform" />
                    </div>

                  </motion.div>
              ) : (
                  // --- MENU DE PERFIL CUSTOMIZADO (NÍVEL 2) ---
                  <motion.div key="profile-menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
                    <div className="flex items-center mb-1">
                      <button
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 text-sm font-bold transition-colors text-blue-600 hover:text-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span className="uppercase tracking-wider text-[11px]">{t("profile.back_options")}</span>
                      </button>
                    </div>

                    {/* ÁREA DA FOTO DE PERFIL */}
                    <div className="flex flex-col items-center justify-center py-4 border-b border-white/10 mb-2">
                      <div
                          className="relative group cursor-pointer"
                          onClick={() => avatarInputRef.current?.click()}
                      >
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                          {avatarPreview ? (
                              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <UserCircleIcon className="w-12 h-12 text-white/20" />
                              </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <CameraIcon className="w-8 h-8 text-white" />
                        </div>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                      </div>
                      <p className="text-[10px] text-white/40 mt-3 uppercase tracking-widest">{t("profile.tap_avatar")}</p>
                    </div>

                    {/* INPUT: USER NAME */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider pl-1">{t("profile.display_name")}</label>
                      <div className="relative">
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                            placeholder={t("profile.name_placeholder")}
                        />
                      </div>
                    </div>

                    {/* INPUT: COURSE */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider pl-1">{t("profile.course_label")}</label>
                      <div className="relative">
                        <AcademicCapIcon className="absolute left-3 top-2.5 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            value={customCourse}
                            onChange={(e) => setCustomCourse(e.target.value)}
                            className="w-full h-10 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                            placeholder={t("profile.course_placeholder")}
                        />
                      </div>
                    </div>

                    {/* CARD DE AVISO */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3 items-start">
                      <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-200/80 leading-relaxed">
                        <strong>{t("profile.verification_title")}</strong> {t("profile.verification_desc", { course: customCourse || t("profile.default_course") })}
                      </p>
                    </div>

                    {/* BOTÃO SALVAR COM ANIMAÇÃO DE CHECK */}
                    <AnimatePresence mode="wait">
                      {!isSaved ? (
                          <motion.button
                              key="save-btn"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={handleSaveProfile}
                              disabled={isSavingProfile}
                              className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSavingProfile ? (
                                <span className="animate-pulse">{t("profile.saving")}</span>
                            ) : (
                                <>
                                  <ArrowUpTrayIcon className="w-4 h-4" />
                                  <span>{t("profile.save")}</span>
                                </>
                            )}
                          </motion.button>
                      ) : (
                          <motion.div
                              key="success-btn"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="w-full mt-2 bg-green-500/20 border border-green-500/50 text-green-300 font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                          >
                            <CheckIcon className="w-5 h-5 text-green-400" />
                            <span>Credentials Updated</span>
                          </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
              )}
            </AnimatePresence>
          </nav>
          <div className="px-6 pb-7 text-[11px] text-white/55 tracking-wide">{t("footer.version")}</div>
        </motion.aside>

        <OnboardModal open={onboardOpen} onClose={handleModalClose} role={chosenRole} onSuccess={handleOnboardSuccess} />
      </div>
  );
};

export default dynamic(() => Promise.resolve(HeroContentComponent), { ssr: false });