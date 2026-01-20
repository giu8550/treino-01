"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import "@/src/i18n";

// --- IMPORTS DA WORKSTATION (INTEGRAÇÃO) ---
import { uploadToPinata } from "@/src/utils/ipfs";
import zoxImage from "@/app/workstation/zox.png";
import ethernautImage from "@/app/workstation/ethernaut.png";
import ballenaImage from "@/app/workstation/ballena.png";

import {
    PlusIcon, ChevronRightIcon, BookmarkIcon,
    VideoCameraIcon, ClipboardIcon, SparklesIcon, TrashIcon,
    EyeIcon, PowerIcon, PaperAirplaneIcon, UserCircleIcon,
    ArrowPathIcon, CommandLineIcon, HeartIcon, CalculatorIcon,
    ChevronUpIcon, ArrowDownTrayIcon, PlayIcon, DocumentDuplicateIcon,
    RocketLaunchIcon, XMarkIcon
} from "@heroicons/react/24/outline";

import MatrixRain from "@/components/main/star-background";
import ResearchCardPDF from "@/components/ui/ResearchCardPDF";

interface StudyDoc { id: string; title: string; url: string; file?: File; }
interface VideoItem { id: string; youtubeId: string; }

// --- CONFIGURAÇÃO DE AGENTES (WORKSTATION) ---
const AGENTS = {
    zenita: {
        name: "Zenita",
        roleKey: "agents.zenita.role",
        icon: CommandLineIcon,
        color: "text-cyan-400",
        bg: "bg-cyan-500/20",
        border: "border-cyan-500/50",
        image: zoxImage,
        boosterImage: "/assets/zenitta-booster.png",
        widthClass: "w-64",
        contentPadding: "pl-[290px]"
    },
    ballena: {
        name: "Ballena",
        roleKey: "agents.ballena.role",
        icon: HeartIcon,
        color: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500/50",
        image: ballenaImage,
        boosterImage: "/assets/ballena-booster.png",
        widthClass: "w-[260px]",
        contentPadding: "pl-[290px]"
    },
    ethernaut: {
        name: "Ethernaut",
        roleKey: "agents.ethernaut.role",
        icon: CalculatorIcon,
        color: "text-purple-400",
        bg: "bg-purple-500/20",
        border: "border-purple-500/50",
        image: ethernautImage,
        boosterImage: "/assets/ethernaut-booster.png",
        widthClass: "w-[260px]",
        contentPadding: "pl-[290px]"
    },
};

type AgentKey = keyof typeof AGENTS;

// --- UTILITÁRIOS ---
const generateSafeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

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

const ActionButton = ({ icon: Icon, label, onClick, colorClass = "hover:text-cyan-500" }: any) => (
    <div className="group relative flex flex-col items-center z-[50]">
        <button
            onClick={(e) => { e.stopPropagation(); onClick(e); }}
            className={`p-2 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full transition-all ${colorClass}`}
        >
            <Icon className="w-4 h-4" />
        </button>
        <span className="absolute -top-8 scale-0 group-hover:scale-100 transition-all bg-slate-800 text-white text-[9px] px-2 py-1 rounded font-bold uppercase whitespace-nowrap z-[100] shadow-xl pointer-events-none">
            {label}
        </span>
    </div>
);

export default function HomeworkPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: session, status } = useSession();

    // REMOVIDO: Workstation Hooks (usePrivy, useWallets)
    // O sistema agora confia puramente na sessão do NextAuth (session)

    const [mounted, setMounted] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);

    // --- ESTADO DE MODO (STUDY vs WORK) ---
    const [viewMode, setViewMode] = useState<"study" | "work">("study");
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Estados de Dados (Study)
    const [studyFiles, setStudyFiles] = useState<StudyDoc[]>([]);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Estados de UI/Controle
    const [chatHistory, setChatHistory] = useState<{role: 'ai' | 'user', text: string}[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [activeFileContext, setActiveFileContext] = useState<string | null>(null);
    const [processingFileId, setProcessingFileId] = useState<string | null>(null);

    // Estados da Workstation
    const [activeWorkSection, setActiveWorkSection] = useState<"doc" | "chat" | "terminal" | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<AgentKey>("zenita");
    const [docTitle, setDocTitle] = useState("Untitled_Research.txt");
    const [docContent, setDocContent] = useState("");
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isBoosterOpen, setIsBoosterOpen] = useState(false);
    const [isSystemProcessing, setIsSystemProcessing] = useState(false); // Renomeado de isBlockchainProcessing

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainScrollRef = useRef<HTMLDivElement>(null);
    const citationsRef = useRef<HTMLElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const workChatRef = useRef<HTMLDivElement>(null);
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

            if (userRole === "professional" || userRole === "entrepreneur") {
                router.replace("/workstation");
            }
        }
    }, [status, session, router]);

    useEffect(() => { setMounted(true); }, []);

    // Scroll inteligente do chat
    useEffect(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        if (workChatRef.current) workChatRef.current.scrollTo({ top: workChatRef.current.scrollHeight, behavior: 'smooth' });
    }, [chatHistory, isTyping, isProcessing, viewMode]);

    // --- LÓGICA DE ALTERNÂNCIA (TOGGLE) ---
    const handleToggleMode = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setViewMode(prev => prev === "study" ? "work" : "study");
            setIsTransitioning(false);
        }, 1500);
    };

    // --- FUNÇÕES COMPARTILHADAS ---
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const addLog = (msg: string) => setTerminalLogs(prev => [...prev, `zaeon@root:~$ ${msg}`]);

    // --- LÓGICA STUDY MODE ---
    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).filter(f => f.type === 'application/pdf').map(file => ({
            id: generateSafeId(), title: file.name, url: URL.createObjectURL(file), file: file
        }));
        setStudyFiles(prev => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePlayDocument = async (doc: StudyDoc) => {
        if (!doc.file || isProcessing || processingFileId) return;
        if (doc.file.size > 15 * 1024 * 1024) { alert("Arquivo muito grande. Limite de 15MB."); return; }
        setProcessingFileId(doc.id);
        setIsProcessing(true);
        setActiveSection(null);
        try {
            const base64Data = await fileToBase64(doc.file);
            setActiveFileContext(base64Data);
            const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Analise o documento "${doc.title}" e me dê um resumo conciso.`, agent: "zenita", fileData: base64Data }) });
            if (!response.ok) throw new Error("Falha na API");
            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', text: `[Contexto Definido: ${doc.title}]\n\n${data.text}` }]);
        } catch (e) { console.error("Erro:", e); alert("Não foi possível processar o documento. Tente novamente."); } finally { setIsProcessing(false); setProcessingFileId(null); }
    };

    const handleUserQuestion = async () => {
        if (!prompt.trim()) return;
        if (viewMode === 'study' && !activeFileContext) {
            setChatHistory(prev => [...prev, { role: 'ai', text: t("homework.chat_empty") }]);
            return;
        }
        const currentPrompt = prompt;
        setPrompt("");
        setChatHistory(prev => [...prev, { role: 'user', text: currentPrompt }]);
        setIsTyping(true);
        try {
            const body = viewMode === 'study'
                ? { prompt: currentPrompt, agent: "zenita", fileData: activeFileContext }
                : { prompt: currentPrompt, agent: selectedAgent };

            const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (e) { setChatHistory(prev => [...prev, { role: 'ai', text: "Erro de conexão." }]); } finally { setIsTyping(false); }
    };

    const handlePasteVideo = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = text.match(regex);
            if (match && match[1]) setVideos(prev => [{ id: generateSafeId(), youtubeId: match[1] }, ...prev]);
        } catch (err) { console.error("Clipboard error"); }
    };

    const handleSpecialistChat = (specialistId: number) => { window.open('https://chat.google.com', '_blank'); };

    // --- LÓGICA WORK MODE (SEM WEB3/WALLET) ---
    const handleAgentSwitch = (key: AgentKey) => {
        if (key === selectedAgent) return;
        setIsAgentMenuOpen(false);
        setIsImageLoading(true);
        setSelectedAgent(key);
        addLog(t("workstation.logs.switched", { name: AGENTS[key].name }));
        setTimeout(() => { setIsImageLoading(false); }, 600);
    };

    const handleBoostAndSave = async () => {
        // NÃO requer mais wallet, apenas sessão do usuário
        setIsSystemProcessing(true);
        addLog("🚀 Initiating System Synchronization...");

        try {
            // Simulando um delay de processamento para UX
            await new Promise(r => setTimeout(r, 1500));
            addLog("✅ Data Integrity Verified.");

            const userId = session?.user?.email || "anonymous_user";
            const res = await fetch('/api/workspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, title: docTitle, content: docContent, agent: selectedAgent, chatHistory, terminalLogs })
            });

            if (res.ok) {
                addLog("✅ Session saved successfully.");
                setIsBoosterOpen(false);
            } else {
                throw new Error("Failed to save to database");
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message || "Save Failed"}`);
        } finally {
            setIsSystemProcessing(false);
        }
    };

    const handleGenerateProtocol = async () => {
        // Removida verificação de wallet
        const agent = AGENTS[selectedAgent];
        setIsSystemProcessing(true);
        addLog(t("workstation.logs.gen_protocol", { name: agent.name }));
        const generatedText = `RESEARCH: ${docTitle}\nAUTHOR: ${agent.name}\nDATE: ${new Date().toISOString()}\n\nANALYSIS: Verified by Zaeon Core.`;
        setDocContent(generatedText);
        try {
            const ipfsHash = await uploadToPinata({ title: docTitle, topic: docTitle, agent: agent.name, content: generatedText });
            if (ipfsHash) addLog(t("workstation.logs.ipfs_success", { hash: ipfsHash }));
        } catch (e) { addLog("❌ IPFS Failed."); } finally { setIsSystemProcessing(false); }
    };

    // --- RENDERIZAÇÃO CONDICIONAL ---
    if (!mounted || status === "loading") {
        return ( <div className="w-full h-screen bg-[#030014] flex items-center justify-center z-[999]"> <IosLoader status="VALIDANDO ACESSO ADMIN..." /> </div> );
    }

    const isAdmin = (session?.user as any)?.isAdmin;
    const userRole = (session?.user as any)?.role;
    const isAuthorized = isAdmin || !userRole || userRole === "student" || userRole === "researcher";

    if (status === "unauthenticated" || !isAuthorized) return null;

    const activeConfig = AGENTS[selectedAgent];
    const panelStyle = "relative overflow-hidden backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.12)] bg-[linear-gradient(135deg,rgba(7,38,77,0.4),rgba(11,58,164,0.3),rgba(7,38,77,0.4))] rounded-[24px] transition-all duration-300";

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if(viewMode === 'study') handleFiles(e.dataTransfer.files); }}
            className={`relative w-full h-screen transition-all duration-500 overflow-hidden flex flex-row ${isFocusMode ? 'z-[200] bg-[#030014]' : 'bg-[#f0f4f8] dark:bg-[#030014]'}`}
        >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20"><MatrixRain /></div>

            {/* LOADER DE TRANSIÇÃO (MAC SPLASH) */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[999] bg-[#030014] flex items-center justify-center">
                        <IosLoader status={t("homework.switching")} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SWITCH MODO FOCO */}
            <div className="fixed top-4 right-17 z-[250] flex flex-col items-center">
                <div onClick={() => setIsFocusMode(!isFocusMode)} className={`w-8 h-14 rounded-full border transition-all cursor-pointer backdrop-blur-xl flex flex-col items-center p-1 ${isFocusMode ? "bg-cyan-900/80 border-cyan-500/50 shadow-lg" : "bg-white/80 border-slate-300 dark:bg-white/10"}`}>
                    <motion.div className={`w-5 h-5 rounded-full flex items-center justify-center ${isFocusMode ? "bg-cyan-400 text-black" : "bg-slate-400 text-white"}`} animate={{ y: isFocusMode ? 0 : 26 }}>
                        {isFocusMode ? <EyeIcon className="w-3 h-3" /> : <PowerIcon className="w-3 h-3" />}
                    </motion.div>
                </div>
            </div>

            {/* --- MODO ESTUDO (CLÁSSICO) --- */}
            {viewMode === "study" && (
                <>
                    <AnimatePresence>
                        {(activeSection || isProcessing) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[15] bg-black/20 backdrop-blur-[1px] pointer-events-none" />}
                    </AnimatePresence>

                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" multiple onChange={(e) => handleFiles(e.target.files)} />

                    <main ref={mainScrollRef} onClick={() => setActiveSection(null)} className={`relative z-20 flex-1 h-full overflow-y-auto pb-40 custom-scrollbar pr-[460px] space-y-12 transition-all duration-700 ${isFocusMode ? 'pt-10' : 'pt-[120px]'} ${isProcessing ? 'blur-[4px] opacity-40' : ''}`}>

                        {/* 1. STUDY FILES */}
                        <section onClick={(e) => { e.stopPropagation(); setActiveSection('study'); }} className={`relative rounded-[41px] p-[1px] transition-all ${activeSection === 'study' ? 'z-[30]' : 'z-[10]'}`}>
                            <div className={`relative p-6 rounded-[40px] border transition-all ${activeSection === 'study' ? 'border-cyan-500 shadow-2xl bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <button onClick={handleToggleMode} className="bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                                        <ArrowPathIcon className="w-3 h-3" />
                                        {t("homework.study_title")}
                                    </button>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                                    {t("homework.switch_hint", { mode: t("homework.mode_work") })}
                                </span>
                                    <div className="ml-auto">
                                        <ActionButton
                                            icon={PlusIcon}
                                            label={t("homework.add_files")}
                                            onClick={() => fileInputRef.current?.click()}
                                            colorClass={`hover:text-cyan-500 ${activeSection === 'study' ? 'dark:text-black' : ''}`}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row gap-6 overflow-x-auto pb-8 pt-2 px-2 min-h-[340px]">
                                    {studyFiles.map(doc => (
                                        <ResearchCardPDF
                                            key={doc.id}
                                            title={doc.title}
                                            fileUrl={doc.url}
                                            isProcessing={processingFileId === doc.id}
                                            onDelete={() => setStudyFiles(prev => prev.filter(f => f.id !== doc.id))}
                                            onPlay={() => handlePlayDocument(doc)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 2. CITATIONS */}
                        <section ref={citationsRef} onClick={(e) => { e.stopPropagation(); setActiveSection('citations'); }} className={`relative rounded-[40px] p-6 border transition-all ${activeSection === 'citations' ? 'border-cyan-500 shadow-2xl z-[30] bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-slate-500 dark:text-cyan-400/60 text-[10px] font-black uppercase tracking-widest block">{t("homework.citations_title")}</span>
                                <div className="flex items-center gap-2">
                                    <ActionButton icon={BookmarkIcon} label="Salvar" onClick={() => {}} />
                                    <ActionButton icon={SparklesIcon} label="Gerar" onClick={() => {}} colorClass="text-purple-500 hover:text-purple-600" />
                                </div>
                            </div>
                            <div className="h-[100px] bg-slate-50/50 dark:bg-black/20 rounded-2xl flex items-center justify-center italic text-slate-400 text-xs">
                                {activeFileContext ? t("homework.citations_ready") : t("homework.citations_empty")}
                            </div>
                        </section>

                        {/* 3. VIDEOS */}
                        <section onClick={(e) => { e.stopPropagation(); setActiveSection('videos'); }} className={`relative rounded-[40px] p-6 border transition-all ${activeSection === 'videos' ? 'border-cyan-400 shadow-2xl z-[30] bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-slate-500 dark:text-cyan-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><VideoCameraIcon className="w-5 h-5" /> {t("homework.videos_title")}</span>
                                <div className="flex items-center gap-2">
                                    <ActionButton icon={ClipboardIcon} label={t("homework.paste_link")} onClick={handlePasteVideo} />
                                    <ActionButton icon={SparklesIcon} label="Insights" onClick={() => alert("Em breve!")} colorClass="text-purple-500 hover:text-purple-600" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-8 overflow-x-auto pb-4 min-h-[300px]">
                                {videos.map(vid => (
                                    <div key={vid.id} className="flex-shrink-0 w-[480px] h-[270px] bg-black rounded-[32px] overflow-hidden shadow-2xl relative group/vid border border-white/5">
                                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${vid.youtubeId}`} frameBorder="0" allowFullScreen />
                                        <button onClick={() => setVideos(prev => prev.filter(v => v.id !== vid.id))} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover/vid:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. SPECIALISTS CHAT CARDS */}
                        <section className="grid grid-cols-2 gap-6 pb-20">
                            {[1, 2].map((num) => {
                                const isActive = activeSection === `specialist-${num}`;
                                return (
                                    <div key={num} onClick={(e) => { e.stopPropagation(); setActiveSection(`specialist-${num}`); }} className={`relative rounded-[40px] border shadow-sm h-[600px] flex flex-col overflow-hidden transition-all duration-500 ${isActive ? 'z-[30] border-cyan-500 shadow-2xl scale-[1.01] bg-white dark:bg-[#0f172a]' : 'z-[10] border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] hover:shadow-xl'}`}>
                                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                                            <div>
                                                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{t("homework.specialist_label")} {num}</span>
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2">{num === 1 ? t("homework.specialist_1") : t("homework.specialist_2")}</h3>
                                            </div>
                                            <UserCircleIcon className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <div className="flex-1 bg-slate-50/30 dark:bg-black/20 p-6 flex items-center justify-center">
                                            <div className="text-center space-y-2 opacity-40">
                                                <PaperAirplaneIcon className="w-8 h-8 mx-auto text-slate-400" />
                                                <p className="text-xs text-slate-500">{t("homework.specialist_start")} {num}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-white/5">
                                            <div className="relative flex items-center">
                                                <input type="text" placeholder={t("homework.specialist_placeholder")} className="w-full bg-slate-100 dark:bg-white/5 rounded-full py-3 px-5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-700 dark:text-white" />
                                                <button onClick={() => handleSpecialistChat(num)} className="absolute right-2 p-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-transform"><PaperAirplaneIcon className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    </main>

                    {/* CHAT ASIDE (STUDY MODE) */}
                    <aside className={`fixed right-6 z-[60] w-[420px] bg-slate-50 shadow-2xl rounded-[40px] flex flex-col border border-slate-200 transition-all duration-700 ${isFocusMode ? 'top-6 h-[calc(100vh-48px)]' : 'top-[123px] h-[calc(100vh-155px)]'}`}>
                        <div className="p-8 border-b border-slate-200 flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isProcessing || isTyping ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("homework.chat_header")}</span>
                            </div>
                            {activeFileContext && <span className="text-[8px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded border border-cyan-200">{t("homework.chat_context_active")}</span>}
                        </div>

                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-10 space-y-6 text-slate-800 text-[14px] leading-relaxed custom-scrollbar">
                            {chatHistory.length === 0 && !isProcessing && (
                                <div className="text-center text-slate-400 text-xs italic mt-20">{t("homework.chat_empty")}</div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`p-5 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-50 ml-4 text-right' : 'bg-white mr-4 shadow-sm text-left'}`}>{msg.text}</div>
                            ))}
                            {(isProcessing || isTyping) && ( <div className="flex justify-center p-4"> <IosLoader status={isProcessing ? t("homework.status_digesting") : t("homework.status_typing")} /> </div> )}
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-white rounded-b-[40px]">
                            <div className="relative">
                                <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserQuestion()} placeholder={activeFileContext ? t("homework.chat_placeholder") : t("homework.chat_empty")} disabled={isProcessing} className="w-full bg-white border border-slate-300 rounded-2xl py-4 px-6 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" />
                                <button onClick={handleUserQuestion} disabled={isTyping || isProcessing || !prompt.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black rounded-xl text-white hover:bg-slate-800 transition-colors disabled:opacity-50">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* --- MODO WORK (WORKSTATION INTEGRADO) --- */}
            {viewMode === "work" && (
                <div className="z-20 w-full max-w-[1700px] h-[88vh] grid grid-cols-12 gap-6 pt-20 px-4">
                    {/* CHAT WINDOW */}
                    <div onClick={() => setActiveWorkSection('chat')} className={`col-span-7 ${panelStyle} flex flex-col ${activeWorkSection === 'chat' ? 'ring-1 ring-cyan-400/50' : ''} relative h-full`}>
                        {/* TOGGLE BUTTON DENTRO DO WORK MODE */}
                        <div className="absolute top-4 left-4 z-40 flex gap-3">
                            <button onClick={handleToggleMode} className="flex items-center gap-2 bg-white/5 border border-white/20 px-4 py-2 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md">
                                <ArrowPathIcon className="w-4 h-4 text-white" />
                                <span className="text-[10px] text-white font-bold uppercase">{t("homework.mode_study")}</span>
                            </button>
                        </div>

                        {/* AGENT RENDER */}
                        <div className="absolute bottom-6 left-6 z-30 flex flex-col items-center">
                            <div className={`relative transition-all duration-500 flex justify-center items-end ${activeConfig.widthClass} h-auto`}>
                                <AnimatePresence mode="wait">
                                    {isImageLoading ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-48 w-full flex items-center justify-center">
                                            <div className="animate-spin text-white/50 w-8 h-8 rounded-full border-2 border-white/20 border-t-cyan-500"></div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key={selectedAgent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex justify-center">
                                            <Image src={activeConfig.image} alt={activeConfig.name} className="w-full h-auto object-contain object-bottom drop-shadow-[0_0_35px_rgba(34,211,238,0.25)] max-h-[550px]" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* AGENT MENU */}
                            <div className="relative mt-2">
                                <AnimatePresence>
                                    {isAgentMenuOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 mb-3 flex flex-col gap-2 bg-[#0a0a0a]/95 border border-white/10 rounded-xl p-2 backdrop-blur-xl shadow-2xl min-w-[160px] z-50">
                                            {Object.keys(AGENTS).map((key) => {
                                                const ag = AGENTS[key as AgentKey];
                                                return (
                                                    <button key={key} onClick={() => handleAgentSwitch(key as AgentKey)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-all text-left">
                                                        <div className={`p-1.5 rounded ${ag.bg} ${ag.color}`}><ag.icon className="w-4 h-4" /></div>
                                                        <div className="flex flex-col"><span className="text-[12px] font-bold text-white">{ag.name}</span></div>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <button onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)} className="flex items-center gap-3 bg-[#0a0a0a]/60 border border-white/10 hover:border-white/20 backdrop-blur-md rounded-full pl-2 pr-4 py-2 transition-all shadow-lg group">
                                    <div className={`p-1.5 rounded-full ${activeConfig.bg} ${activeConfig.color} border ${activeConfig.border}`}><activeConfig.icon className="w-4 h-4" /></div>
                                    <span className="text-xs font-bold text-white tracking-wide">{activeConfig.name}</span>
                                    <ChevronUpIcon className={`w-3 h-3 text-white/30 ml-2 transition-transform duration-300 ${isAgentMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div ref={workChatRef} className="flex-1 relative p-6 overflow-y-auto custom-scrollbar flex flex-col z-0 pt-16">
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
                                <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserQuestion()} placeholder={t("workstation.chat_placeholder", { role: t(activeConfig.roleKey).toLowerCase() })} className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none font-mono text-sm" />
                                <button onClick={handleUserQuestion} className="bg-cyan-500 text-black px-6 rounded-xl font-bold text-xs uppercase hover:bg-cyan-400 active:scale-95 transition-all h-11">Send</button>
                            </div>
                        </div>
                    </div>

                    {/* DOC & TERMINAL */}
                    <div className="col-span-5 flex flex-col gap-4 h-full">
                        <div onClick={() => setActiveWorkSection('doc')} className={`${panelStyle} flex-1 flex flex-col ${activeWorkSection === 'doc' ? 'ring-1 ring-cyan-400/50' : ''}`}>
                            <div className="h-14 bg-black/40 border-b border-white/10 flex items-center px-6">
                                <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="bg-transparent text-white/90 text-sm font-mono focus:outline-none w-full" />
                            </div>
                            <textarea value={docContent} onChange={(e) => setDocContent(e.target.value)} className="flex-1 p-8 font-mono text-sm text-slate-900 bg-[#f1f5f9] outline-none resize-none" />
                            <div className="p-4 bg-[#f1f5f9] flex justify-end gap-3 rounded-b-[24px]">
                                <button onClick={() => setIsBoosterOpen(true)} className="px-4 py-2 rounded-xl text-[11px] font-bold border transition flex items-center gap-2 bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200 uppercase tracking-wider">
                                    <ArrowDownTrayIcon className="w-4 h-4" /> {t("workstation.session_save")}
                                </button>
                                <button onClick={handleGenerateProtocol} disabled={isSystemProcessing} className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition flex items-center gap-2 uppercase tracking-wider ${isSystemProcessing ? 'bg-yellow-100 text-yellow-700 border-yellow-400' : 'bg-green-100 text-green-700 border-green-400 hover:bg-green-200'}`}>
                                    <PlayIcon className="w-4 h-4" /> {isSystemProcessing ? t("workstation.processing") : t("workstation.generate")}
                                </button>
                            </div>
                        </div>
                        {!isFocusMode && (
                            <div onClick={() => setActiveWorkSection('terminal')} className={`${panelStyle} h-[28%] flex flex-col shrink-0`}>
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
            )}

            {/* --- SESSION BOOSTER MODAL (DATABASE ONLY) --- */}
            <AnimatePresence>
                {isBoosterOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBoosterOpen(false)} className="absolute inset-0 bg-[#030014]/90 backdrop-blur-md cursor-pointer" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-5xl bg-[#0a0a0a] border border-cyan-500/20 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)] flex flex-col md:flex-row min-h-[500px]">
                            <button onClick={() => setIsBoosterOpen(false)} className="absolute top-6 right-6 z-50 text-white/30 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                            <div className="w-full md:w-1/2 relative min-h-[400px] bg-black">
                                <motion.div key={activeConfig.boosterImage} initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full h-full">
                                    <Image src={activeConfig.boosterImage} alt="Neural Booster" fill className="object-cover" priority />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a] hidden md:block" />
                                </motion.div>
                            </div>
                            <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6"><RocketLaunchIcon className="w-3 h-3" /> System Uplink</div>
                                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Sync {activeConfig.name}&apos;s <span className="text-cyan-400">Memory Core</span></h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-10">Securely persist your research session to the database.</p>
                                <div className="flex flex-col gap-4">
                                    <button onClick={handleBoostAndSave} disabled={isSystemProcessing} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-3 uppercase tracking-widest text-xs group disabled:opacity-50">
                                        {isSystemProcessing ? <div className="animate-spin border-t-black border-2 w-5 h-5 rounded-full" /> : <><RocketLaunchIcon className="w-5 h-5 group-hover:scale-110 transition-transform" /> Save Session Data</>}
                                    </button>
                                    <button onClick={() => setIsBoosterOpen(false)} className="w-full py-2 text-white/30 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors">Back to Station</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}