"use client";
import React, { useEffect, useRef, useState } from "react";
import { 
  XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, 
  LockClosedIcon, ChevronRightIcon 
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";

const ROLES = [
  { slug: "student", key: "roles.student" },
  { slug: "researcher", key: "roles.researcher" },
  { slug: "professional", key: "roles.professional" },
  { slug: "entrepreneur", key: "roles.entrepreneur" },
  { slug: "cyber_hall", key: "Hall Cibernético" },
] as const;

type Role = typeof ROLES[number]["slug"];

export default function OnboardModal({ open, onClose, role, onSuccess }: { open: boolean; onClose: () => void; role: Role; onSuccess: (data: any) => void }) {
  const { t } = useTranslation();
  const [betaCode, setBetaCode] = useState("");
  const [betaError, setBetaError] = useState(false);

  if (!open) return null;

  const steps = [
    { key: "id", label: "ID", placeholder: "...", type: "text" },
    { key: "name", label: t("modal.name"), placeholder: "Your Name", type: "text" },
    { key: "email", label: t("modal.email"), placeholder: "you@email.com", type: "email" },
    { key: "phone", label: t("modal.phone"), placeholder: "(00) 00000-0000", type: "text" },
    { key: "docs", label: t("modal.docs_label"), placeholder: t("modal.pdf_placeholder"), type: "file" },
  ] as const;

  const handleBetaSubmit = () => {
    if (betaCode !== "ZAEON-ALPHA-KEY") {
      setBetaError(true);
      setTimeout(() => setBetaError(false), 500);
    } else {
      alert("Code Accepted. Welcome to Beta.");
    }
  };

  const inputClass = "h-10 rounded-lg border border-white/5 bg-black/40 px-3 text-white/30 placeholder:text-white/10 outline-none w-full cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative w-full max-w-[900px] rounded-2xl border border-white/10 bg-[#0b121f] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)]/50" />
        <button onClick={onClose} className="absolute right-3 top-3 z-50 rounded-md p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] min-h-[500px]">
          <div className="p-8 space-y-5 relative">
            <div className="absolute inset-0 z-10 bg-black/10 pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 opacity-50">
              <LockClosedIcon className="w-4 h-4 text-white/60" />
              <p className="text-xs font-bold text-white/60 tracking-widest uppercase">Registration Locked</p>
            </div>

            <div className="space-y-4 opacity-60 grayscale-[0.5] pointer-events-none select-none">
              {steps.map((s) => (
                <div key={s.key} className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <p className="text-[12px] text-white/50 font-semibold text-right">{s.label}</p>
                  <div className="relative w-full">
                    {s.key === 'docs' ? (
                      <div className="h-10 w-full rounded-lg border border-dashed border-white/10 bg-black/20 flex items-center px-3">
                        <DocumentArrowUpIcon className="w-4 h-4 mr-2 text-white/20" />
                        <span className="text-xs text-white/20">{t("modal.upload_placeholder")}</span>
                      </div>
                    ) : (
                      <input disabled className={inputClass} placeholder={s.placeholder} />
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

          <div className="relative bg-[linear-gradient(160deg,rgba(15,23,42,0.6),rgba(30,41,59,0.8))] border-l border-white/5 p-8 flex flex-col justify-center items-center text-center">
            <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
            <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-[280px]">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                <ExclamationTriangleIcon className="w-7 h-7 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-bold text-lg tracking-tight">Early Access</h3>
                <p className="text-[12px] leading-relaxed text-slate-300 font-medium">
                  Zaeon is currently available for <strong className="text-yellow-400">BETA testers ONLY</strong>.
                </p>
              </div>
              <input 
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value)}
                placeholder="XXXX-XXXX"
                className={`w-full h-10 rounded-xl bg-black/40 text-center text-white text-sm font-mono tracking-widest outline-none border transition-all ${betaError ? "border-red-500" : "border-white/10 focus:border-cyan-400/50"}`}
              />
              <button onClick={() => signIn('google')} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}