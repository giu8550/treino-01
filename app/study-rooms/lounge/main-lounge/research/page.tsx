"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CpuChipIcon, 
    BeakerIcon, 
    ChevronDownIcon, 
    ServerStackIcon,
    CurrencyDollarIcon,
    LockClosedIcon, 
    ArrowPathIcon,
    PaperClipIcon,
    XMarkIcon,
    CloudArrowUpIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

// --- TYPES ---
interface ResearchItem {
    id: number | string;
    title: string;
    participants: { grads: number; masters: number; phds: number };
    progress: number;
    status: string;
    details: {
        agents: string[];
        commercial: number;
        research: number;
        social: number;
        profitability: number;
        rank: string;
    };
    isReal?: boolean;
}

// --- SUB-COMPONENT: RESEARCH CARD ---
function ResearchCard({ item }: { item: ResearchItem }) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [ipStatus, setIpStatus] = useState<string>("negotiate_ip");

    const handleNegotiate = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setIpStatus("not_available");
    };

    const isPending = item.status === "pending_analysis";

    const getProgressLabel = (p: number, status: string): string => {
        if (status === "pending_analysis") return t("research_module.status_pending", "Submission in analysis...");
        if (p < 25) return t("research_module.exploring", "Exploring");
        if (p < 51) return t("research_module.validating", "Validating");
        if (p < 75) return t("research_module.building", "Building");
        if (p < 99) return t("research_module.review", "Awaiting Review");
        return t("research_module.completed", "Completed");
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isPending ? 0.6 : 1, y: 0 }}
            className={`rounded-2xl border transition-all relative overflow-hidden mb-4
                ${isPending ? "cursor-wait bg-white/5 border-white/5 grayscale" : "cursor-pointer group"}
                ${isExpanded 
                    ? "bg-white dark:bg-[#1e293b] border-blue-500/50 shadow-2xl z-10" 
                    : !isPending && "bg-white/40 dark:bg-white/[0.03] border-slate-200 dark:border-white/5 hover:border-[#0f172a]/30 dark:hover:border-white/20"
                }`}
            onClick={() => !isPending && setIsExpanded(!isExpanded)}
        >
            {/* Header */}
            <div className="p-5 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-[#0f172a]/5 dark:bg-white/10 text-[#0f172a] dark:text-white'}`}>
                        <BeakerIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pr-4">
                        <h4 className="text-xs font-bold text-[#0f172a] dark:text-slate-200 uppercase max-w-lg leading-tight">
                            {item.title}
                        </h4>
                        {/* Rank Badge no Header (Apenas S e SS) */}
                        {!isPending && (item.details.rank === "S" || item.details.rank === "SS") && (
                            <span className={`text-[9px] font-black ml-1 ${
                                item.details.rank === 'SS' ? 'text-blue-600 dark:text-blue-500' : 'text-amber-500'
                            }`}>
                                {t("research_module.rank")} {item.details.rank}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[80px]">
                     <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase text-right whitespace-nowrap
                        ${isPending 
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse' 
                            : item.progress > 90 
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                                : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                        }`}>
                        {getProgressLabel(item.progress, item.status)}
                    </span>
                    {!isPending && (
                        <ChevronDownIcon className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                </div>
            </div>

            {/* Expansão */}
            <AnimatePresence>
                {isExpanded && !isPending && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-black/20"
                    >
                        <div className="p-5 border-t border-slate-200 dark:border-white/5">
                            
                            {/* Agentes */}
                            <div className="mb-4">
                                <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
                                    <ServerStackIcon className="w-3 h-3" /> {t("research_module.agents_production", "Agents in Production")}
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {item.details.agents.map((agent: string, idx: number) => (
                                        <span key={idx} className="text-[9px] px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded border border-blue-500/20">
                                            {agent}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Métricas */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {[
                                    { label: "Commercial", val: item.details.commercial },
                                    { label: "Research", val: item.details.research },
                                    { label: "Social", val: item.details.social },
                                    { label: "Profitability", val: item.details.profitability }
                                ].map((metric, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[9px] mb-1 text-slate-500">
                                            <span>{metric.label}</span>
                                            <span className="font-mono">{metric.val}%</span>
                                        </div>
                                        <div className="h-1 bg-slate-200 dark:bg-white/10 rounded-full">
                                            <div style={{ width: `${metric.val}%` }} className="h-full bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- FOOTER DO CARD (RANK + BOTÃO) --- */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-white/5">
                                {/* RANK VOLTOU AQUI */}
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider">Project Rank</span>
                                    <span className={`text-3xl font-black ${
                                        item.details.rank === 'SS' ? 'text-blue-500' : 
                                        item.details.rank === 'S' ? 'text-amber-500' : 
                                        item.details.rank === 'A' ? 'text-green-500' :
                                        'text-slate-700 dark:text-white'
                                    }`}>
                                        {item.details.rank}
                                    </span>
                                </div>

                                <button 
                                    onClick={handleNegotiate}
                                    className={`text-[10px] font-bold px-6 py-2 rounded-xl transition-all flex items-center gap-2
                                        ${ipStatus === "negotiate_ip" 
                                            ? "bg-[#0f172a] text-white hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-blue-400" 
                                            : "bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed"
                                        }`}
                                >
                                    <CurrencyDollarIcon className="w-4 h-4" />
                                    {t(`research_module.${ipStatus}`)}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// --- MAIN COMPONENT ---
export default function ResearchModule() {
    const { t } = useTranslation();
    const [data, setData] = useState<ResearchItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isSubmissionMode, setIsSubmissionMode] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProtocol = async (query: string = "") => {
        setLoading(true);
        try {
            const response = await fetch(`/api/research?query=${encodeURIComponent(query)}`);
            const json = await response.json();
            setData(json);
        } catch (error) {
            console.error("Connection lost", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProtocol("");
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSubmissionMode(false);
        setFormTitle("");
        setSelectedFile(null);
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!formTitle || !selectedFile) return;

        setIsUploading(true);

        try {
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: formTitle,
                    participants: { grads: 4, masters: 2, phds: 1 }, 
                    hasFile: true 
                })
            });
            
            if (res.ok) {
                setFormTitle("");
                setSelectedFile(null);
                setIsSubmissionMode(false);
                setShowSuccess(true);
                await fetchProtocol(""); 
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col gap-6 relative pb-20">
            
            {/* --- SUBMISSION CARD --- */}
            <motion.div 
                layout
                transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                className={`w-full rounded-3xl border border-white/10 shadow-xl relative overflow-hidden transition-colors duration-300
                    ${isSubmissionMode 
                        ? "bg-[#0b1120] ring-1 ring-blue-500/50 cursor-default" 
                        : "bg-[#0f172a] hover:bg-[#16203a] cursor-pointer"
                    }`}
                onClick={() => !isSubmissionMode && setIsSubmissionMode(true)}
            >
                <div className="p-6 relative z-10">
                    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                        <CpuChipIcon className="w-24 h-24 text-red-500/50" />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'} ${isSubmissionMode ? '' : 'animate-pulse'}`} />
                                {!isSubmissionMode && <div className={`absolute inset-0 w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'} animate-ping opacity-75`} />}
                            </div>

                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/90">
                                {isSubmissionMode 
                                    ? t("research_module.init_protocol", "INITIATE PROTOCOL") 
                                    : loading 
                                        ? "SYNCING LEDGER..." 
                                        : (
                                            <span className="group-hover:text-blue-400 transition-colors">
                                                <span className="block group-hover:hidden">{t("research_module.active_projects", { count: data.length, defaultValue: "35 ACTIVE PROJECTS" })}</span>
                                                <span className="hidden group-hover:block">{t("research_module.submit_hover", "SUBMIT MY RESEARCH")}</span>
                                            </span>
                                        )
                                }
                            </h3>
                        </div>

                        {isSubmissionMode && (
                            <button onClick={handleCancel} className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {!isSubmissionMode ? (
                            <motion.div 
                                key="status"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-20 flex items-center justify-center border border-white/5 bg-white/[0.02] rounded-lg group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition-colors"
                            >
                                <div className="flex items-center gap-3 text-slate-500 group-hover:text-blue-400 transition-colors">
                                    <CloudArrowUpIcon className="w-5 h-5" />
                                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                                        {t("research_module.click_submit", "Click to Initialize Submission")}
                                    </span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="form"
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col gap-4 overflow-visible"
                            >
                                <div className="space-y-1 pt-2">
                                    <label className="text-[9px] uppercase font-bold text-slate-400 pl-1">{t("research_module.label_title", "Project Title")}</label>
                                    <input 
                                        type="text"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder={t("research_module.ph_title", "Ex: Quantum Resistance...")}
                                        className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        className={`h-12 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all flex-1
                                            ${selectedFile 
                                                ? "bg-blue-500/20 border-blue-500/50 text-blue-300" 
                                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        {selectedFile ? <DocumentTextIcon className="w-4 h-4" /> : <PaperClipIcon className="w-4 h-4" />}
                                        <span className="text-xs font-bold uppercase truncate max-w-[150px]">
                                            {selectedFile ? selectedFile.name : "Attach File"}
                                        </span>
                                        {selectedFile && (
                                            <div onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="ml-2 hover:text-red-400">
                                                <XMarkIcon className="w-3 h-3" />
                                            </div>
                                        )}
                                    </button>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleCancel}
                                            disabled={isUploading}
                                            className="h-12 px-6 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase border border-transparent hover:border-white/10"
                                        >
                                            Cancel
                                        </button>

                                        <button 
                                            onClick={handleSubmit}
                                            disabled={!formTitle || !selectedFile || isUploading}
                                            className="h-12 px-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                                        >
                                            {isUploading ? (
                                                <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending...</>
                                            ) : (
                                                <><ArrowUpTrayIcon className="w-4 h-4" /> Submit</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* --- LIST HEADER --- */}
            <div className="flex items-center justify-between px-2 mt-2">
                <h2 className="text-[#0f172a] dark:text-white text-sm font-bold uppercase tracking-widest">
                   Recent Submissions
                </h2>
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                        {t("research_module.api_connected", "API Connected")}
                    </span>
                </div>
            </div>

            {/* --- GRID --- */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/5 animate-pulse h-[100px]" />
                    ))
                ) : (
                    data.map((item) => (
                        <ResearchCard key={item.id} item={item} />
                    ))
                )}
            </div>

            {/* --- SUCCESS MODAL --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowSuccess(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircleIcon className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Submission Received</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    An agent will review your work and contact you soon about the submission result. Thanks!
                                </p>
                                <button 
                                    onClick={() => setShowSuccess(false)}
                                    className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}