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
    // 0
    "In situ Biosynthesis of Bacterial Cellulose/Graphene Oxide Composites via Komagataeibacter Fermentation",
    // 1
    "Mycelium-Based Memristor Arrays: Low-Cost Neuromorphic Computing on Fungal Substrates",
    // 2
    "Engineered PETase (FAST-PETase-Class) for Rapid Depolymerization of Post-Consumer PET Under Mild Conditions",
    // 3
    "Bacillus Spore–Enabled Self-Healing Concrete via Microbially Induced Calcium Carbonate Precipitation (MICP)",
    // 4
    "Artificial Photosynthesis for Flue-Gas CO₂ Capture and In-Situ Conversion to Fuels/Chemicals",
    // 5
    "Plant Electrophysiology Interfaces: Biohybrid Plant–Machine Communication for Environmental Sensing",
    // 6
    "Bioleaching Rare Earth Elements from E-Waste Using Fungi-Driven Urban Biomining",
    // 7
    "High-Resolution Electronic Skin (E-Skin) Sensor Arrays for Tactile Feedback in Advanced Prosthetics",
    // 8
    "Genetic Algorithms + Protein Language Models for Multi-Objective Enzyme/Protein Optimization",
    // 9
    "Synthetic DNA Archival Data Storage with Error Correction and Random-Access Retrieval",
    // 10
    "Bioluminescent Bio-Modules for Urban Accent Lighting: Pilot-Scale Alternatives to Conventional Fixtures",
    // 11
    "Chitin/Chitosan-Based Membranes and Sponges for Microplastic Removal in Wastewater Streams",
];

// --- MÉTRICAS FIXAS BASEADAS NA REALIDADE ---
const FIXED_METRICS = [
    // 0: Bacterial Cellulose (Material Science)
    // Comercial: 45% (Possível, uso em baterias/filtros, mas escala difícil)
    // Research: 65% (Material interessante, mas não revolucionário)
    // Social: 30% (Indireto)
    // Profit: 45% (Custos de fermentação vs preço de mercado)
    { commercial: 45, research: 65, social: 30, profitability: 45 },

    // 1: Mycelium Memristors (Bio-Computing)
    // Comercial: 20% (Muito remoto, "wetware" ainda é ficção científica comercial)
    // Research: 80% (Pesquisa de base fortíssima para computação não-silício)
    // Social: 25% (Baixo impacto imediato)
    // Profit: 15% (Longe de dar lucro)
    { commercial: 20, research: 80, social: 25, profitability: 15 },

    // 2: PETase (Enzima come plástico)
    // Comercial: 75% (Alta demanda global por reciclagem química)
    // Research: 75% (Otimização enzimática é hot topic)
    // Social: 80% (Resolve um dos maiores problemas do mundo)
    // Profit: 60% (Gestão de resíduos tem margem apertada, mas alto volume)
    { commercial: 75, research: 75, social: 80, profitability: 60 },

    // 3: Self-Healing Concrete (Infraestrutura)
    // Comercial: 70% (Demanda existente em construção civil)
    // Research: 55% (Tecnologia já conhecida, foco em aplicação)
    // Social: 60% (Segurança e durabilidade urbana)
    // Profit: 65% (Produto premium para construção)
    { commercial: 70, research: 55, social: 60, profitability: 65 },

    // 4: Artificial Photosynthesis (Energia)
    // Comercial: 35% (Difícil competir com solar + baterias atualmente)
    // Research: 85% (O "Santo Graal" da química)
    // Social: 85% (Salvação climática potencial)
    // Profit: 40% (Infraestrutura cara)
    { commercial: 35, research: 85, social: 85, profitability: 40 },

    // 5: Plant Electrophysiology (AgTech/Sensores)
    // Comercial: 25% (Nicho remoto, agricultura de precisão extrema)
    // Research: 70% (Interação bio-digital)
    // Social: 40% (Monitoramento ambiental)
    // Profit: 30% (Hardware difícil de vender em massa)
    { commercial: 25, research: 70, social: 40, profitability: 30 },

    // 6: Bioleaching Rare Earths (Mineração Urbana)
    // Comercial: 65% (Metais estratégicos valem muito)
    // Research: 60% (Processos biológicos industriais)
    // Social: 70% (Reduz mineração tóxica tradicional)
    // Profit: 75% (Matéria prima é lixo, produto final é ouro/litio) - Teto de Profit
    { commercial: 65, research: 60, social: 70, profitability: 75 },

    // 7: E-Skin (MedTech)
    // Comercial: 45% (Mercado de próteses é caro e regulado)
    // Research: 75% (Avanços em tato artificial)
    // Social: 75% (Qualidade de vida para amputados)
    // Profit: 55% (Alto custo de P&D)
    { commercial: 45, research: 75, social: 75, profitability: 55 },

    // 8: Protein Language Models (AI/Bio)
    // Comercial: 80% (Pharma paga bilhões por descoberta de drogas)
    // Research: 85% (Fronteira da ciência atual)
    // Social: 70% (Cura de doenças)
    // Profit: 75% (Modelo SaaS/Licenciamento - Teto de Profit)
    { commercial: 80, research: 85, social: 70, profitability: 75 },

    // 9: DNA Data Storage (Big Data)
    // Comercial: 25% (Muito lento/caro para uso hoje, futuro distante)
    // Research: 80% (Codificação genética de dados)
    // Social: 30% (Arquivamento histórico)
    // Profit: 25% (Custo por megabyte inviável hoje)
    { commercial: 25, research: 80, social: 30, profitability: 25 },

    // 10: Bioluminescent Lighting (Arquitetura Bio)
    // Comercial: 30% (Estético, novidade, não substitui LED)
    // Research: 50% (Biologia sintética básica)
    // Social: 35% (Menos eletricidade, mas pouco impacto global)
    // Profit: 30% (Difícil escalar organismos vivos na casa das pessoas)
    { commercial: 30, research: 50, social: 35, profitability: 30 },

    // 11: Chitin Membranes (Microplastics Filter)
    // Comercial: 55% (Estações de tratamento de água precisam)
    // Research: 45% (Química de polímeros conhecida)
    // Social: 75% (Saúde pública e oceanos)
    // Profit: 50% (Produto commodity de baixo custo)
    { commercial: 55, research: 45, social: 75, profitability: 50 },
];

const AGENT_NAMES: string[] = [
    "Neuro-Scribe", "Quantum-Oracle", "Helix-Weaver", "Chronos-Watch", "Logic-Gatekeeper", 
    "Synapse-Architect", "Data-Wraith", "Isotope-X", "Cipher-Daemon", "Echo-Mind", 
    "Prism-Analyzer", "Void-Walker", "Nano-Stitcher", "Aether-Link", "Vector-7"
];

const getRank = (score: number): string => {
    // Ajustado levemente para refletir a realidade mais dura das métricas
    if (score >= 75) return "SS"; 
    if (score >= 65) return "S";
    if (score >= 50) return "A";
    if (score >= 35) return "B";
    return "C";
};

// Gerador de dados
const RESEARCH_DATA: ResearchItem[] = Array.from({ length: 35 }).map((_, i) => {
    const titleIndex = i % TITLES.length;
    
    // 1. Progresso (Mantido)
    let progress;
    if (i === 0) progress = 75;
    else if (i === 1) progress = 69;
    else if (i === 2) progress = 65;
    else progress = Math.floor(Math.random() * 46) + 5; 

    // 2. Lógica de Participantes (Mantida)
    let phds = 0;
    if (i < 3) phds = 1;

    let masters = 0;
    if (i < 15) masters = Math.floor(Math.random() * 2) + 1; 

    const grads = Math.floor(Math.random() * 4) + 1; 

    // 3. Lógica de Stats (FIXA e REALISTA)
    const stats = FIXED_METRICS[titleIndex];
    const avgScore = (stats.commercial + stats.research + stats.social + stats.profitability) / 4;
    const rank = getRank(avgScore);

    // 4. Lógica de Agentes (Mantida)
    let agentCount;
    if (rank === "SS" || rank === "S") {
        agentCount = Math.floor(Math.random() * 2) + 4; // 4 ou 5
    } else {
        agentCount = Math.floor(Math.random() * 4) + 2; // 2 a 5
    }

    const shuffledAgents = [...AGENT_NAMES].sort(() => 0.5 - Math.random());
    const projectAgents = shuffledAgents.slice(0, agentCount);

    return {
        id: i + 1,
        title: TITLES[titleIndex] + (i > 11 ? ` [Phase ${Math.floor(i/5)}]` : ""),
        participants: { grads, masters, phds }, 
        progress: progress,
        status: progress > 50 ? "building" : "in_progress",
        details: { 
            agents: projectAgents, 
            commercial: stats.commercial, 
            research: stats.research, 
            social: stats.social, 
            profitability: stats.profitability, 
            rank: rank 
        }
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

    const getStatusLabel = (s: string) => {
        return s === "building" ? t("research_module.building", "Building") : t("research_module.exploring", "Exploring"); 
    };

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
                        {/* RANK BADGE NO HEADER */}
                        {(item.details.rank === "S" || item.details.rank === "SS") && (
                            <span className={`text-[9px] font-black ml-1 ${
                                item.details.rank === 'SS' ? 'text-blue-600 dark:text-blue-500' : 'text-amber-500'
                            }`}>
                                {t("research_module.rank")} {item.details.rank}
                            </span>
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
                                            // LÓGICA DE COR DO RANK SS ALTERADA PARA AZUL
                                            item.details.rank === 'SS' ? 'text-blue-600 dark:text-blue-500' : 
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