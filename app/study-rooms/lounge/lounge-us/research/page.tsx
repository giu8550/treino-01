"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CpuChipIcon, 
    BeakerIcon, 
    ChevronDownIcon, 
    ServerStackIcon,
    CurrencyDollarIcon,
    LockClosedIcon, 
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

// --- TYPES ---
interface Participants {
    grads: number;
    masters: number;
    phds: number;
}

interface ResearchDetails {
    agents: string[];
    commercial: number;
    research: number;
    social: number;
    profitability: number;
    rank: string;
}

interface ResearchItem {
    id: number;
    title: string;
    participants: Participants;
    progress: number;
    status: string;
    details: ResearchDetails;
}

// --- DATA ---
const TITLES: string[] = [
    "Graphene Bio-synthesis via E.Coli Bacteria",
    "Mycelium Neural Networks: Organic Data Processing",
    "Z-77 Enzyme: Accelerated PET Polymer Degradation",
    "Self-healing Concrete with Bacterial Spores",
    "Artificial Photosynthesis for Industrial Carbon Capture",
    "Neuro-Botanical Interface: Plant-Machine Communication",
    "Bio-mining of Rare Earths in E-Waste",
    "Sensory Synthetic Skin for Advanced Prosthetics",
    "Genetic Algorithms for Protein Optimization",
    "Synthetic DNA Data Storage (Project Glass)",
    "Urban Bioluminescence: Public Lighting Replacement",
    "Microplastic Filtration via Chitin Membranes",
];

const AGENT_NAMES: string[] = ["Alpha-Node", "Synapse-X", "Core-V", "Flux-8", "Vertex-Alpha", "Omni-1", "Nexus-9"];

const getRank = (score: number): string => {
    if (score >= 95) return "SS";
    if (score >= 85) return "S";
    if (score >= 70) return "A";
    if (score >= 50) return "B";
    return "C";
};

// Gerador de dados (igual ao original)
const RESEARCH_DATA: ResearchItem[] = Array.from({ length: 35 }).map((_, i) => {
    let progress;
    if (i === 0) progress = 75;
    else if (i === 1) progress = 69;
    else if (i === 2) progress = 65;
    else progress = Math.floor(Math.random() * 46) + 5; 

    let phds = 0, masters = 0;
    if (i < 4) { phds = Math.floor(Math.random() * 3) + 1; masters = Math.floor(Math.random() * 4) + 1; }
    else if (i < 18) { masters = Math.floor(Math.random() * 4) + 1; }

    const commercial = Math.floor(Math.random() * 40) + 60;
    const research = Math.floor(Math.random() * 40) + 60;
    const social = Math.floor(Math.random() * 40) + 60;
    const profitability = Math.floor(Math.random() * 40) + 60;
    const avgScore = (commercial + research + social + profitability) / 4;

    const agentCount = Math.floor(Math.random() * 4) + 2;
    const projectAgents: string[] = [];
    for(let k=0; k<agentCount; k++) {
        projectAgents.push(AGENT_NAMES[k % AGENT_NAMES.length]);
    }

    return {
        id: i + 1,
        title: TITLES[i % TITLES.length] + (i > 11 ? ` [Phase ${Math.floor(i/5)}]` : ""),
        participants: { grads: Math.floor(Math.random() * 8) + 2, masters, phds },
        progress: progress,
        status: progress > 50 ? "building" : "in_progress", // Usando chaves para tradução
        details: { agents: projectAgents, commercial, research, social, profitability, rank: getRank(avgScore) }
    };
});

// --- SUB-COMPONENT ---
interface ResearchCardProps {
    item: ResearchItem;
}

function ResearchCard({ item }: ResearchCardProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [ipStatus, setIpStatus] = useState<string>("negotiate_ip");

    const handleNegotiate = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setIpStatus("not_available");
    };

    // Helper para status traduzido
    const getStatusLabel = (s: string) => {
        return s === "building" ? t("research_module.building", "Building") : t("research_module.exploring", "Exploring"); // Simplificado
    };

    // Helper para label de progresso traduzido
    const getProgressLabel = (p: number): string => {
        if (p < 25) return t("research_module.exploring", "Exploring");
        if (p < 51) return t("research_module.validating", "Validating");
        if (p < 75) return t("research_module.building", "Building");
        if (p < 99) return t("research_module.review", "Awaiting Review");
        return t("research_module.completed", "Completed");
    };

    return (
        <motion.div 
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                ${isExpanded 
                    ? "bg-white dark:bg-[#1e293b] border-blue-500/50 shadow-2xl z-10" 
                    : "bg-white/40 dark:bg-white/[0.03] border-slate-200 dark:border-white/5 hover:border-[#0f172a]/30 dark:hover:border-white/20"
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-[#0f172a]/5 dark:bg-white/10 text-[#0f172a] dark:text-white'}`}>
                        <BeakerIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-[#0f172a] dark:text-slate-200 uppercase max-w-md leading-tight">
                            {item.title}
                        </h4>
                        {(item.details.rank === "S" || item.details.rank === "SS") && (
                            <span className="text-[9px] font-black text-amber-500 ml-1">{t("research_module.rank")} {item.details.rank}</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                     <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${item.progress > 90 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                        {getProgressLabel(item.progress)}
                    </span>
                    {isExpanded && <ChevronDownIcon className="w-3 h-3 text-slate-400 animate-bounce" />}
                </div>
            </div>

            <div className="flex gap-4 mb-4 pl-11">
                {item.participants.phds > 0 && (
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">
                        <b className="text-[#0f172a] dark:text-white">{item.participants.phds}</b> {t("research_module.phds", "PhDs")}
                    </div>
                )}
                {item.participants.masters > 0 && (
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">
                        <b className="text-[#0f172a] dark:text-white">{item.participants.masters}</b> {t("research_module.masters", "Masters")}
                    </div>
                )}
                <div className="text-[9px] text-slate-500 dark:text-slate-400">
                    <b className="text-[#0f172a] dark:text-white">{item.participants.grads}</b> {t("research_module.undergrads", "Undergrads")}
                </div>
            </div>

            <div className="pl-11">
                <div className="flex justify-between text-[9px] font-bold mb-1 text-[#0f172a] dark:text-white">
                    <span className="uppercase tracking-wide">{getProgressLabel(item.progress)}</span>
                    <span>{item.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${item.progress > 90 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-[#0f172a] to-blue-600 dark:from-blue-600 dark:to-purple-500'}`}
                    />
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 pl-2">
                            
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

                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
                                {[
                                    { label: t("research_module.commercial", "Commercial App"), val: item.details.commercial },
                                    { label: t("research_module.research", "Research App"), val: item.details.research },
                                    { label: t("research_module.social", "Social Impact"), val: item.details.social },
                                    { label: t("research_module.profitability", "Profitability"), val: item.details.profitability }
                                ].map((metric, idx: number) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[9px] mb-1">
                                            <span className="text-slate-500">{metric.label}</span>
                                            <span className="font-mono text-slate-700 dark:text-slate-300">{metric.val}/100</span>
                                        </div>
                                        <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${metric.val}%` }} 
                                                className={`h-full rounded-full ${metric.val > 80 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-4 bg-slate-50 dark:bg-black/20 p-3 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase text-slate-400">{t("research_module.project_rank", "Project Rank")}</span>
                                        <span className={`text-2xl font-black ${
                                            item.details.rank === 'SS' ? 'text-purple-500' : 
                                            item.details.rank === 'S' ? 'text-amber-500' : 
                                            'text-slate-700 dark:text-white'
                                        }`}>
                                            {item.details.rank}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleNegotiate}
                                    className={`text-[10px] font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2
                                        ${ipStatus === "negotiate_ip" 
                                            ? "bg-[#0f172a] text-white hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-blue-400" 
                                            : "bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed"
                                        }`}
                                >
                                    <CurrencyDollarIcon className="w-3 h-3" />
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

    return (
        <div className="w-full h-full flex flex-col gap-6">
            
            <div className="w-full p-6 rounded-3xl bg-[#0f172a] border border-white/10 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <CpuChipIcon className="w-24 h-24 text-red-500/50" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/90">
                            {t("research_module.active_projects", { count: 35, defaultValue: "35 ACTIVE PROJECTS" })}
                        </h3>
                    </div>
                    
                    <div className="h-20 flex items-center justify-center border border-red-500/20 bg-red-500/5 rounded-lg">
                        <div className="flex items-center gap-3 text-red-400">
                            <LockClosedIcon className="w-5 h-5" />
                            <span className="font-mono text-xs font-bold uppercase tracking-wider">
                                {t("research_module.credentials_error", "You don't have enough credentials to access the chat")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-2">
                <h2 className="text-[#0f172a] dark:text-white text-sm font-bold uppercase tracking-widest">
                </h2>
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                     </span>
                     <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                         {t("research_module.api_connected", "API Connected")}
                     </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-20">
                {RESEARCH_DATA.map((item: ResearchItem) => (
                    <ResearchCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}