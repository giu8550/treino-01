"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
    ChartBarIcon, IdentificationIcon, CurrencyDollarIcon,
    CheckBadgeIcon, XCircleIcon, ServerIcon,
    ShieldCheckIcon, ArrowLeftIcon, EnvelopeIcon, DocumentTextIcon,
    ClockIcon, FunnelIcon, EyeIcon, PowerIcon,
    DocumentMagnifyingGlassIcon, ExclamationTriangleIcon,
    CommandLineIcon, SparklesIcon, DocumentChartBarIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";

// --- TYPES ---
interface UserRequest {
    id: string;
    name: string;
    email: string;
    role: "Professor" | "Student" | "Entrepreneur";
    status: "pending" | "approved" | "rejected";
    walletAddress?: string;
    submittedAt: string;
    documents: { name: string; url: string }[];
    bio?: string;
    institution?: string;
    source: "google_quick" | "manual_form";
}

const STARTUP_DATE = new Date("2026-01-15T00:00:00");

const IosLoader = ({ status }: { status: string }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest animate-pulse">{status}</span>
    </div>
);

export default function AdminControlRoom() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"monitor" | "credentials" | "agents" | "reports" | "payments">("credentials");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const [requests, setRequests] = useState<UserRequest[]>([]);
    const [selectedReq, setSelectedReq] = useState<UserRequest | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isProcessingTx, setIsProcessingTx] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await fetch('/api/admin');
                if (response.ok) {
                    const data: UserRequest[] = await response.json();
                    setRequests(data.filter(r => new Date(r.submittedAt) >= STARTUP_DATE));
                } else { throw new Error(); }
            } catch (error) {
                setRequests([
                    { id: "req_001", name: "Pedro Alcantara", email: "pedro@gmail.com", role: "Student", status: "pending", submittedAt: new Date().toISOString(), source: "google_quick", documents: [], bio: "" },
                    { id: "req_002", name: "Dr. Roberto Silva", email: "roberto@usp.br", role: "Professor", status: "pending", submittedAt: new Date().toISOString(), walletAddress: "0x71C...9A2", institution: "USP", source: "manual_form", documents: [{ name: "PhD.pdf", url: "#" }], bio: "Quantum Researcher" }
                ]);
            } finally { setIsLoadingData(false); }
        };
        if (mounted) fetchQueue();
    }, [mounted]);

    if (!mounted) return <div className="w-full h-screen bg-[#030014] flex items-center justify-center"><IosLoader status="INITIALIZING..." /></div>;

    // Lógica de Estilo: O Modo Foco agora remove o padding top para esconder a navbar global
    const containerStyle = `relative w-full h-screen transition-all duration-500 overflow-hidden flex font-sans ${isFocusMode ? 'bg-[#030014] z-[200] pt-0' : 'bg-slate-100 dark:bg-[#030014] pt-[110px]'}`;
    const cardBase = "bg-white dark:bg-[rgba(10,10,20,0.7)] backdrop-blur-md rounded-[32px] overflow-hidden transition-all duration-300 border border-slate-200 dark:border-white/10";
    const cardShadow = "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none";

    return (
        <div className={containerStyle}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 hidden dark:block"><MatrixRain /></div>

            {/* AVISO DE MODO DEV (Founder Green) */}
            {!(session?.user as any)?.isAdmin && (
                <div className="absolute top-10 right-10 z-[100] bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">Dev Hack: Active</span>
                </div>
            )}

            {/* TOGGLE FOCUS - ALINHADO RIGOROSAMENTE COM A SIDEBAR (LEFT-6) */}
            <div className="fixed left-6 z-[210] transition-all duration-500" style={{ top: isFocusMode ? '24px' : '24px' }}>
                <div
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    title={isFocusMode ? "Sair do Foco" : "Modo Foco"}
                    className={`w-12 h-12 rounded-2xl border cursor-pointer shadow-xl flex items-center justify-center transition-all hover:scale-105 ${isFocusMode ? "bg-cyan-500 border-cyan-400 text-black shadow-cyan-500/20" : "bg-white dark:bg-black/40 border-slate-200 dark:border-white/20 text-slate-400 dark:text-white/40 hover:text-cyan-500"}`}
                >
                    {isFocusMode ? <EyeIcon className="w-6 h-6" /> : <PowerIcon className="w-6 h-6" />}
                </div>
            </div>

            {/* SIDEBAR */}
            <motion.nav
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
                animate={{
                    width: isSidebarOpen ? 260 : 80,
                    x: isFocusMode ? -150 : 0,
                    opacity: isFocusMode ? 0 : 1
                }}
                className={`fixed left-6 z-[100] flex flex-col py-8 transition-all duration-300 rounded-[35px] border shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-black/80 border-slate-200 dark:border-white/10 h-[calc(100vh-160px)] top-[100px]`}
            >
                {/* FOUNDER STATUS - VERDE ESMERALDA */}
                <div className="flex items-center gap-4 px-6 mb-10">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />
                    </div>
                    {isSidebarOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                            <h1 className="text-xs font-black tracking-tighter uppercase text-slate-800 dark:text-white">Founder</h1>
                            <p className="text-[9px] font-bold text-emerald-500 uppercase">Authenticated</p>
                        </motion.div>
                    )}
                </div>

                <div className="flex flex-col gap-3 px-3">
                    <SidebarItem icon={ChartBarIcon} label="Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={IdentificationIcon} label="Queue" active={activeTab === 'credentials'} onClick={() => setActiveTab('credentials')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={SparklesIcon} label="Agentes" active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={DocumentChartBarIcon} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={CurrencyDollarIcon} label="Revenue" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} isOpen={isSidebarOpen} />
                </div>

                <div className="mt-auto px-3">
                    <button
                        onClick={() => router.push('/')} // CORREÇÃO: Volta para a Home (Hero Content)
                        className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-slate-400 hover:bg-red-500/10 hover:text-red-500"
                    >
                        <ArrowLeftIcon className="w-6 h-6 shrink-0" />
                        {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Exit Node</span>}
                    </button>
                </div>
            </motion.nav>

            <main className={`flex-1 relative z-10 transition-all duration-500 ${isFocusMode ? 'pl-24' : 'pl-[120px]'} pr-10 pb-10 h-full flex flex-col`}>
                {activeTab === 'credentials' && (
                    <div className="flex-1 flex gap-8 overflow-hidden animate-in fade-in slide-in-from-bottom-4">

                        {/* LISTA (ESQUERDA) */}
                        <div className={`w-[400px] ${cardBase} ${cardShadow} flex flex-col bg-white/80 dark:bg-[#0a0a14]/60`}>
                            <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                <div><h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">Queue</h2><p className="text-[10px] uppercase font-bold text-slate-400">{requests.length} pending objects</p></div>
                                <FunnelIcon className="w-5 h-5 text-slate-400 cursor-pointer hover:text-cyan-500" />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                                {requests.map((req) => (
                                    <div
                                        key={req.id}
                                        onClick={() => setSelectedReq(req)}
                                        className={`p-5 rounded-3xl border transition-all duration-300 relative group
                                            ${selectedReq?.id === req.id
                                            ? 'bg-white dark:bg-cyan-500/10 border-cyan-500 shadow-xl scale-[1.03]'
                                            : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{req.role}</span>
                                            {req.documents.length === 0 && <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />}
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{req.name}</h3>
                                        <p className="text-[11px] text-slate-400 dark:text-white/40">{req.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DETALHES (DIREITA) */}
                        <div className={`flex-1 ${cardBase} ${cardShadow} bg-white dark:bg-[#0a0a14]/80 p-10 overflow-y-auto custom-scrollbar`}>
                            {selectedReq ? (
                                <motion.div key={selectedReq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                    <div className="flex items-center gap-8 pb-10 border-b border-slate-100 dark:border-white/10">
                                        <div className="w-24 h-24 rounded-[35px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-3xl font-black text-slate-300 dark:text-white/10 shadow-inner">
                                            {selectedReq.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">{selectedReq.name}</h1>
                                                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">Secured Node</span>
                                            </div>
                                            <p className="text-slate-400 font-mono text-sm">{selectedReq.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl hover:text-cyan-500 transition-colors"><EnvelopeIcon className="w-6 h-6" /></button>
                                            <button className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><XCircleIcon className="w-6 h-6" /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <DetailCard title="Institution Data" value={selectedReq.institution || "Personal Account"} icon={ServerIcon} />
                                        <DetailCard title="Origin" value={selectedReq.source === 'google_quick' ? 'Google Cloud' : 'Manual Entry'} icon={IdentificationIcon} color="text-purple-500" />
                                    </div>

                                    {/* Document Section */}
                                    <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Verification Documents</h3>
                                        {selectedReq.documents.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[30px]">
                                                <DocumentMagnifyingGlassIcon className="w-10 h-10 text-slate-200 mb-4" />
                                                <p className="text-xs font-bold text-slate-400 uppercase">Awaiting credentials upload</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedReq.documents.map((doc, i) => (
                                                    <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                                                        <span className="text-xs font-bold text-cyan-500">{doc.name}</span>
                                                        <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="w-full bg-slate-900 dark:bg-cyan-500 hover:scale-[1.01] active:scale-[0.99] text-white dark:text-black font-black py-6 rounded-[35px] shadow-2xl transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4"
                                    >
                                        <ShieldCheckIcon className="w-6 h-6" />
                                        Authorize Soulbound Access
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <Image src="/assets/zaeon-logo.png" alt="Logo" width={100} height={100} className="grayscale mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">System Idle</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
            `}</style>
        </div>
    );
}

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
            active
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-white/40'
        }`}
    >
        <Icon className={`w-6 h-6 shrink-0 ${active ? 'scale-110' : 'group-hover:text-slate-800 dark:group-hover:text-white'}`} />
        {isOpen && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black uppercase tracking-widest">{label}</motion.span>}
    </button>
);

const DetailCard = ({ title, value, icon: Icon, color = "text-cyan-500" }: any) => (
    <div className="p-6 rounded-[35px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-4 h-4 ${color}`} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
);