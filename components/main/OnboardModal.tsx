"use client";
import React, { useEffect, useState } from "react";
import { 
  XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, 
  LockClosedIcon, ChevronRightIcon 
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";

type Role = "student" | "researcher" | "professional" | "entrepreneur" | "cyber_hall";

export default function OnboardModal({ open, onClose, role }: { open: boolean; onClose: () => void; role: Role }) {
  const { t } = useTranslation();
  const [betaCode, setBetaCode] = useState("");
  const [betaError, setBetaError] = useState(false);

  useEffect(() => {
    if (open) { setBetaCode(""); setBetaError(false); }
  }, [open]);

  if (!open) return null;

  const handleBetaSubmit = () => {
    if (betaCode !== "ZAEON-ALPHA-KEY") {
      setBetaError(true);
      setTimeout(() => setBetaError(false), 500);
    } else {
      alert("Code Accepted.");
    }
  };

  const steps = [
    { key: "id", label: "ID", placeholder: "...", type: "text" },
    { key: "name", label: t("modal.name"), placeholder: "Your Name", type: "text" },
    { key: "email", label: t("modal.email"), placeholder: "you@email.com", type: "email" },
    { key: "phone", label: t("modal.phone"), placeholder: "(00) 00000-0000", type: "text" },
    { key: "docs", label: t("modal.docs_label"), placeholder: t("modal.pdf_placeholder"), type: "file" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative w-full max-w-[900px] rounded-2xl border border-white/10 bg-black/70 dark:bg-[#0b121f] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)]/50" />
        <button onClick={onClose} className="absolute right-3 top-3 z-50 p-2 text-white/50 hover:text-white transition-colors">
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] min-h-[500px]">
          {/* LADO ESQUERDO: FORM TRAVADO */}
          <div className="p-8 space-y-5 relative">
            <div className="flex items-center gap-2 mb-6 opacity-50">
              <LockClosedIcon className="w-4 h-4 text-white/60" />
              <p className="text-xs font-bold text-white/60 tracking-widest uppercase">Registration Locked</p>
            </div>
            <div className="space-y-4 opacity-60 grayscale-[0.5] pointer-events-none select-none">
              {steps.map((s) => (
                <div key={s.key} className="grid grid-cols-[120px_1fr] items-center gap-4">
                  <p className="text-[12px] text-white/50 font-semibold text-right">{s.label}</p>
                  <div className="h-10 rounded-lg border border-white/5 bg-black/40 px-3 flex items-center text-white/30 text-xs">
                    {s.placeholder}
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-8 right-8">
               <button disabled className="w-full h-10 rounded-xl bg-white/5 text-white/20 text-sm font-semibold border border-white/5 cursor-not-allowed">
                  Awaiting Access Code...
               </button>
            </div>
          </div>

          {/* LADO DIREITO: BETA ACCESS */}
          <div className="relative bg-[linear-gradient(160deg,rgba(15,23,42,0.6),rgba(30,41,59,0.8))] dark:bg-cyan-950/40 border-l border-white/5 p-8 flex flex-col justify-center items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-7 h-7 text-yellow-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Early Access</h3>
            <p className="text-[12px] text-slate-300 mb-6">Zaeon is currently available for <strong className="text-yellow-400">BETA testers ONLY</strong>.</p>
            <div className="w-full space-y-4">
              <input 
                value={betaCode} onChange={(e) => setBetaCode(e.target.value)}
                placeholder="XXXX-XXXX"
                className={`w-full h-10 rounded-xl bg-black/40 text-center text-white text-sm font-mono border ${betaError ? "border-red-500" : "border-white/10"}`}
              />
              <div className="flex items-center gap-3 w-full opacity-60 my-4">
                 <div className="h-px bg-white/20 flex-1" />
                 <span className="text-[10px] text-white">OR</span>
                 <div className="h-px bg-white/20 flex-1" />
              </div>
              <button onClick={() => signIn('google')} className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-white hover:scale-110 transition-transform">
                <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}