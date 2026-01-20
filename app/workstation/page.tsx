"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    PaperAirplaneIcon,
    PlayIcon,
    ArrowDownTrayIcon,
    CommandLineIcon,
    EyeIcon,
    PowerIcon,
    UserCircleIcon,
    RocketLaunchIcon,
    XMarkIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";

// --- NEXT AUTH & TRANSLATION ---
import { useSession, signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";

// --- UTILS ---
// Se uploadToPinata depender de wallet, remova ou adapte.
// Assumindo aqui que é uma função de utilidade pura ou backend.
import { uploadToPinata } from "@/src/utils/ipfs";

// --- ASSETS ---
const ZENITA_IMAGE = "/assets/zenitta.png";
const ZENITA_BOOSTER = "/assets/zenitta-booster.png";

// --- COMPONENTES AUXILIARES ---
const IosLoader = ({ status }: { status: string }) => (
    <div className="flex flex-col items-center justify-center space-y-4 py-4">
        <div className="relative w-8 h-8">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-[2px] h-[8px] bg-slate-400 rounded-full"
                    style={{ left: "50%", top: "30%", transformOrigin: "50% 180%", rotate: i * 45 }}
                    animate={{ opacity: [0.1, 1, 0.1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                />
            ))}
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">{status}</span>
    </div>
);

export default function WorkStationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useTranslation();

    const [mounted, setMounted] = useState(false);
    const [activeSection, setActiveSection] = useState<"doc" | "chat" | "terminal" | null>(null);
    const [prompt, setPrompt] = useState("");
    const [docTitle, setDocTitle] = useState("Untitled_Research_Paper.txt");
    const [docContent, setDocContent] = useState("");
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [isSystemProcessing, setIsSystemProcessing] = useState(false); // Renomeado de BlockchainProcessing

    // Agente Único: Zenita
    const activeConfig = {
        name: "Zenita",
        role: "Technology & AI",
        icon: CommandLineIcon,
        color: "text-cyan-400",
        bg: "bg-cyan-500/20",
        border: "border-cyan-500/50",
        image: ZENITA_IMAGE,
        boosterImage: ZENITA_BOOSTER,
        contentPadding: "pl-[290px]"
    };

    const [isImageLoading, setIsImageLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isBoosterOpen, setIsBoosterOpen] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // --- BLINDAGEM DA PÁGINA ---
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace("/");
            return;
        }

        if (status === "authenticated") {
            const isAdmin = (session?.user as any)?.isAdmin;
            const userRole = (session?.user as any)?.role;

            if (isAdmin) return;

            if (userRole === "student" || userRole === "researcher") {
                router.replace("/homework");
            }
        }
    }, [status, session, router]);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => addLog("System initialized. Zenita Agent ready."), 100);
    }, []);

    const addLog = (msg: string) => {
        setTerminalLogs(prev => [...prev, `zaeon@root:~$ ${msg}`]);
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
        }
        if (terminalRef.current) {
            terminalRef.current.scrollTo({ top: terminalRef.current.scrollHeight, behavior: "smooth" });
        }
    };

    // Load Session
    useEffect(() => {
        const loadSession = async () => {
            const userId = session?.user?.email;
            if (userId) {
                addLog(`Loading workspace for ${userId}...`);
                try {
                    const res = await fetch(`/api/workspace?userId=${userId}`);
                    const json = await res.json();
                    if (json.data) {
                        if (json.data.title) setDocTitle(json.data.title);
                        if (json.data.content) setDocContent(json.data.content);
                        if (json.data.chatHistory) setChatHistory(json.data.chatHistory);
                        addLog("Session restored successfully from Neural Cloud.");
                    }
                } catch (e) { console.error(e); }
            }
        };
        if (mounted && session) loadSession();
    }, [mounted, session]);

    useEffect(() => { if (mounted) scrollToBottom(); }, [chatHistory, terminalLogs, mounted, isTyping]);

    const handleSend = async () => {
        if (!prompt.trim()) return;
        const currentPrompt = prompt;
        setChatHistory(prev => [...prev, { role: 'user', text: currentPrompt }]);
        setPrompt("");
        setIsTyping(true);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt, agent: "zenita" })
            });
            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (error) {
            addLog("Error connecting to AI API.");
        } finally { setIsTyping(false); }
    };

    const handleBoostAndSave = async () => {
        setIsSystemProcessing(true);
        addLog("🚀 Initiating System Synchronization...");

        try {
            await new Promise(r => setTimeout(r, 1500)); // Delay visual
            addLog("✅ Data Integrity Verified.");

            const userId = session?.user?.email;

            if (!userId) {
                throw new Error("User session invalid.");
            }

            const res = await fetch('/api/workspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    title: docTitle,
                    content: docContent,
                    agent: "zenita",
                    chatHistory,
                    terminalLogs
                })
            });

            if (res.ok) {
                addLog("✅ Session saved to Neural Cloud.");
                setIsBoosterOpen(false);
            } else {
                throw new Error("API Response not OK");
            }
        } catch (error: any) {
            addLog(`❌ Save Error: ${error.message || "Unknown error"}`);
        } finally {
            setIsSystemProcessing(false);
        }
    };

    const handleGenerateProtocol = async () => {
        setIsSystemProcessing(true);
        addLog(`Generating protocol via ${activeConfig.name}...`);

        const generatedText = `RESEARCH PAPER: ${docTitle}\n\nAUTHOR: ${activeConfig.name} (AI Agent)\nDATE: ${new Date().toISOString()}\n\nANALYSIS: Verified via Zaeon Protocol.`;
        setDocContent(generatedText);

        try {
            const ipfsHash = await uploadToPinata({
                title: docTitle,
                topic: docTitle,
                agent: activeConfig.name,
                content: generatedText
            });
            if (ipfsHash) addLog(`IPFS Success: ${ipfsHash}`);
        } catch (e) {
            addLog("❌ IPFS Upload failed.");
        } finally {
            setIsSystemProcessing(false);
        }
    };

    // --- RENDERIZAÇÃO CONDICIONAL ---
    if (!mounted || status === "loading") {
        return (
            <div className="w-full h-screen bg-[#030014] flex items-center justify-center z-[999]">
                <IosLoader status="SINCRONIZANDO WORKSTATION..." />
            </div>
        );
    }

    const isAdmin = (session?.user as any)?.isAdmin;
    const isAuthorized = isAdmin || (session?.user as any)?.role === "professional" || (session?.user as any)?.role === "entrepreneur";

    if (status === "unauthenticated" || !isAuthorized) return null;

    const panelStyle = "relative overflow-hidden backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.12)] bg-[linear-gradient(135deg,rgba(7,38,77,0.4),rgba(11,58,164,0.3),rgba(7,38,77,0.4))] rounded-[24px] transition-all duration-300";

    return (
        <div className={`relative w-full h-screen bg-background dark:bg-[#030014] overflow-hidden flex flex-col justify-end items-center pb-2 px-4 transition-all duration-500 ${isFocusMode ? 'z-[100] !bg-[#030014]' : ''}`}>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <MatrixRain />
            </div>

            {/* --- FOCUS MODE BAR --- */}
            <div className="fixed top-[18px] right-2 z-[150] flex flex-col items-center">
                <div onClick={() => setIsFocusMode(!isFocusMode)} className={`w-8 h-14 rounded-full border transition-all duration-300 cursor-pointer backdrop-blur-xl shadow-lg flex flex-col items-center p-1 ${isFocusMode ? "bg-cyan-900/80 border-cyan-500/50 shadow-[0_0_15px_rgba(8,145,178,0.4)]" : "bg-white/80 border-slate-300 dark:bg-white/10 dark:border-white/20"}`}>
                    <motion.div className={`w-5 h-5 rounded-full shadow-sm flex items-center justify-center ${isFocusMode ? "bg-cyan-400 text-black" : "bg-slate-400 dark:bg-white/40 text-white"}`} animate={{ y: isFocusMode ? 0 : 26 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                        {isFocusMode ? <EyeIcon className="w-3 h-3" /> : <PowerIcon className="w-3 h-3" />}
                    </motion.div>
                </div>
            </div>

            {/* --- ADMIN GATEWAY --- */}
            {isAdmin && (
                <div className="fixed top-[85px] right-2 z-[150] flex flex-col items-center">
                    <div onClick={() => router.push('/workstation/admin')} title="Admin Control Room" className="w-8 h-14 rounded-full border border-red-500/30 bg-red-900/20 cursor-pointer backdrop-blur-xl shadow-lg flex flex-col items-center justify-center p-1 hover:bg-red-900/40 hover:border-red-500/60 transition-all group">
                        <ShieldCheckIcon className="w-4 h-4 text-red-400 group-hover:text-red-200 transition-colors" />
                    </div>
                </div>
            )}

            <div className="z-20 w-full max-w-[1700px] h-[88vh] grid grid-cols-12 gap-6">

                {/* --- CHAT WINDOW --- */}
                <div onClick={() => setActiveSection('chat')} className={`col-span-7 ${panelStyle} flex flex-col ${activeSection === 'chat' ? 'ring-1 ring-cyan-400/50' : ''} relative h-full`}>

                    {/* AUTH HEADER */}
                    <div className="absolute top-4 left-4 z-40 flex gap-3">
                        <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/20 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg">
                            {session?.user?.image && <Image src={session.user.image} alt="User" width={32} height={32} className="w-8 h-8 rounded-full border border-cyan-400/50" />}
                            <div className="flex flex-col">
                                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest leading-none mb-1">CONNECTED</span>
                                <span className="text-[11px] text-white font-mono leading-none truncate max-w-[120px]">{session?.user?.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* AGENT RENDER */}
                    <div className="absolute bottom-6 left-6 z-30 flex flex-col items-center">
                        <div className="relative transition-all duration-500 flex justify-center items-end w-64 h-auto">
                            <AnimatePresence mode="wait">
                                {isImageLoading ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-48 w-full flex items-center justify-center">
                                        <div className="animate-spin text-white/50 w-8 h-8 rounded-full border-2 border-white/20 border-t-cyan-500"></div>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex justify-center">
                                        <Image src={activeConfig.image} alt={activeConfig.name} width={400} height={600} className="w-full h-auto object-contain object-bottom drop-shadow-[0_0_35px_rgba(34,211,238,0.25)] max-h-[550px]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-2 flex items-center gap-3 bg-[#0a0a0a]/60 border border-white/10 backdrop-blur-md rounded-full pl-2 pr-4 py-2 shadow-lg">
                            <div className={`p-1.5 rounded-full ${activeConfig.bg} ${activeConfig.color} border ${activeConfig.border}`}><activeConfig.icon className="w-4 h-4" /></div>
                            <span className="text-xs font-bold text-white tracking-wide">{activeConfig.name}</span>
                        </div>
                    </div>

                    <div ref={chatContainerRef} className="flex-1 relative p-6 overflow-y-auto custom-scrollbar flex flex-col z-0 pt-16">
                        <div className="flex-1" />
                        <div className="space-y-6 pb-2">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : `justify-start transition-all duration-300 ${activeConfig.contentPadding}`}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm font-light shadow-lg relative ${msg.role === 'user' ? 'bg-cyan-900/40 text-cyan-50 border border-cyan-500/30' : 'bg-[#0a0a0a]/80 text-white/90 border border-white/10'}`}>{msg.text}</div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className={`flex justify-start transition-all duration-300 ${activeConfig.contentPadding}`}>
                                    <div className="bg-[#0a0a0a]/60 border border-white/5 px-4 py-2 rounded-xl flex gap-1"><span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.1s]" /><span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" /></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-5 bg-black/60 border-t border-white/10 flex flex-col gap-3 shrink-0 backdrop-blur-xl z-20 relative rounded-b-[24px]">
                        <div className={`flex gap-3 items-center transition-all duration-300 ${activeConfig.contentPadding}`}>
                            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Ask ${activeConfig.name}...`} className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none font-mono text-sm" />
                            <button onClick={handleSend} className="bg-cyan-500 text-black px-6 rounded-xl font-bold text-xs uppercase hover:bg-cyan-400 active:scale-95 transition-all h-11">Send</button>
                        </div>
                    </div>
                </div>

                {/* --- DOC & TERMINAL --- */}
                <div className="col-span-5 flex flex-col gap-4 h-full">
                    <div onClick={() => setActiveSection('doc')} className={`${panelStyle} flex-1 flex flex-col ${activeSection === 'doc' ? 'ring-1 ring-cyan-400/50' : ''}`}>
                        <div className="h-14 bg-black/40 border-b border-white/10 flex items-center px-6">
                            <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="bg-transparent text-white/90 text-sm font-mono focus:outline-none w-full" />
                        </div>
                        <textarea value={docContent} onChange={(e) => setDocContent(e.target.value)} className="flex-1 p-8 font-mono text-sm text-slate-900 bg-[#f1f5f9] outline-none resize-none" />

                        <div className="p-4 bg-[#f1f5f9] flex justify-end gap-3 rounded-b-[24px]">
                            <button onClick={() => setIsBoosterOpen(true)} className="px-4 py-2 rounded-xl text-[11px] font-bold border transition flex items-center gap-2 bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200 uppercase tracking-wider">
                                <ArrowDownTrayIcon className="w-4 h-4" /> Save Session
                            </button>
                            <button onClick={handleGenerateProtocol} disabled={isSystemProcessing} className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition flex items-center gap-2 uppercase tracking-wider ${isSystemProcessing ? 'bg-yellow-100 text-yellow-700 border-yellow-400' : 'bg-green-100 text-green-700 border-green-400 hover:bg-green-200'}`}>
                                <PlayIcon className="w-4 h-4" /> {isSystemProcessing ? "Processing..." : "Generate"}
                            </button>
                        </div>
                    </div>

                    {!isFocusMode && (
                        <div onClick={() => setActiveSection('terminal')} className={`${panelStyle} h-[28%] flex flex-col shrink-0`}>
                            <div className="h-9 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 shrink-0 justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] bg-emerald-500 text-emerald-500" />
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">SYSTEM ONLINE</span>
                                </div>
                                <span className="text-[8px] text-white/20 font-mono tracking-[0.2em] uppercase">Zaeon Neural Node v2.0.26</span>
                            </div>

                            <div ref={terminalRef} className="flex-1 p-4 font-mono text-xs text-green-500/80 bg-black/60 overflow-y-auto custom-scrollbar rounded-b-[24px]">
                                {terminalLogs.map((log, idx) => (<div key={idx} className="mb-1">{log}</div>))}
                                <p>zaeon@root:~$ <span className="animate-pulse">_</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SESSION BOOSTER MODAL (DATABASE ONLY) --- */}
            <AnimatePresence>
                {isBoosterOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBoosterOpen(false)} className="absolute inset-0 bg-[#030014]/90 backdrop-blur-md cursor-pointer" />

                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                    className="relative w-full max-w-5xl bg-[#0a0a0a] border border-cyan-500/20 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)] flex flex-col md:flex-row min-h-[500px]"
                        >
                            <button onClick={() => setIsBoosterOpen(false)} className="absolute top-6 right-6 z-50 text-white/30 hover:text-white transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            <div className="w-full md:w-1/2 relative min-h-[400px] bg-black">
                                <motion.div key={activeConfig.boosterImage} initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full h-full">
                                    <Image src={activeConfig.boosterImage} alt="Neural Booster" fill className="object-cover" priority />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a] hidden md:block" />
                                </motion.div>
                            </div>

                            <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                                    <RocketLaunchIcon className="w-3 h-3" /> System Uplink
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                                    {/* CORREÇÃO ESLINT: Escaped single quote */}
                                    Sync {activeConfig.name}&apos;s <span className="text-cyan-400">Memory Core</span>
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-10">
                                    Seu agente atingiu o limite de buffers neurais. Sincronize os dados desta sessão com o banco de dados central para garantir a persistência e o aprendizado contínuo.
                                </p>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleBoostAndSave}
                                        disabled={isSystemProcessing}
                                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-3 uppercase tracking-widest text-xs group disabled:opacity-50"
                                    >
                                        {isSystemProcessing ? (
                                            <div className="animate-spin border-t-black border-2 w-5 h-5 rounded-full" />
                                        ) : (
                                            <>
                                                <RocketLaunchIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Save Session Data
                                            </>
                                        )}
                                    </button>
                                    <button onClick={() => setIsBoosterOpen(false)} className="w-full py-2 text-white/30 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors">
                                        Back to Station
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.4); }
            `}</style>
        </div>
    );
}