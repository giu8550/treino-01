"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/src/i18n";
import {
    PlusIcon, ChevronRightIcon, BookmarkIcon,
    VideoCameraIcon, ClipboardIcon, SparklesIcon, TrashIcon,
    EyeIcon, PowerIcon, PaperAirplaneIcon, UserCircleIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";
import ResearchCardPDF from "@/components/ui/ResearchCardPDF";

interface StudyDoc { id: string; title: string; url: string; file?: File; }
interface VideoItem { id: string; youtubeId: string; }

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
    const [mounted, setMounted] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Estados de Dados
    const [studyFiles, setStudyFiles] = useState<StudyDoc[]>([]);
    const [videos, setVideos] = useState<VideoItem[]>([]);

    // Estados de UI/Controle
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<{role: 'ai' | 'user', text: string}[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [activeFileContext, setActiveFileContext] = useState<string | null>(null);
    const [processingFileId, setProcessingFileId] = useState<string | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainScrollRef = useRef<HTMLDivElement>(null);
    const citationsRef = useRef<HTMLElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    // Scroll inteligente do chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatHistory, isTyping, isProcessing]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    // --- FUNÇÕES PRINCIPAIS ---

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files)
            .filter(f => f.type === 'application/pdf')
            .map(file => ({
                id: generateSafeId(),
                title: file.name,
                url: URL.createObjectURL(file),
                file: file
            }));

        setStudyFiles(prev => [...prev, ...newFiles]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePlayDocument = async (doc: StudyDoc) => {
        if (!doc.file || isProcessing || processingFileId) return;

        if (doc.file.size > 15 * 1024 * 1024) {
            alert("Arquivo muito grande. Limite de 15MB.");
            return;
        }

        setProcessingFileId(doc.id);
        setIsProcessing(true);
        setActiveSection(null);

        try {
            const base64Data = await fileToBase64(doc.file);
            setActiveFileContext(base64Data);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Analise o documento "${doc.title}" e me dê um resumo conciso.`,
                    agent: "zenita",
                    fileData: base64Data
                })
            });

            if (!response.ok) throw new Error("Falha na API");

            const data = await response.json();

            setChatHistory(prev => [...prev, {
                role: 'ai',
                text: `[Contexto Definido: ${doc.title}]\n\n${data.text}`
            }]);

        } catch (e) {
            console.error("Erro:", e);
            alert("Não foi possível processar o documento. Tente novamente.");
        } finally {
            setIsProcessing(false);
            setProcessingFileId(null);
        }
    };

    const handleUserQuestion = async () => {
        if (!prompt.trim()) return;

        if (!activeFileContext) {
            setChatHistory(prev => [...prev, {
                role: 'ai',
                text: "⚠️ Por favor, clique no botão 'Play' em um dos documentos primeiro para que eu possa estudá-lo."
            }]);
            return;
        }

        const currentPrompt = prompt;
        setPrompt("");
        setChatHistory(prev => [...prev, { role: 'user', text: currentPrompt }]);
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    agent: "zenita",
                    fileData: activeFileContext
                })
            });
            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'ai', text: "Erro de conexão. Tente novamente." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handlePasteVideo = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = text.match(regex);
            if (match && match[1]) {
                setVideos(prev => [{ id: generateSafeId(), youtubeId: match[1] }, ...prev]);
            }
        } catch (err) { console.error("Clipboard error"); }
    };

    const handleSpecialistChat = (specialistId: number) => {
        window.open('https://chat.google.com', '_blank');
    };

    if (!mounted) return null;

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            className={`relative w-full h-screen transition-all duration-500 overflow-hidden flex flex-row ${isFocusMode ? 'z-[200] bg-[#030014]' : 'bg-[#f0f4f8] dark:bg-[#030014]'}`}
        >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20"><MatrixRain /></div>

            {/* SWITCH MODO FOCO */}
            <div className="fixed top-4 right-17 z-[250] flex flex-col items-center">
                <div onClick={() => setIsFocusMode(!isFocusMode)} className={`w-8 h-14 rounded-full border transition-all cursor-pointer backdrop-blur-xl flex flex-col items-center p-1 ${isFocusMode ? "bg-cyan-900/80 border-cyan-500/50 shadow-lg" : "bg-white/80 border-slate-300 dark:bg-white/10"}`}>
                    <motion.div className={`w-5 h-5 rounded-full flex items-center justify-center ${isFocusMode ? "bg-cyan-400 text-black" : "bg-slate-400 text-white"}`} animate={{ y: isFocusMode ? 0 : 26 }}>
                        {isFocusMode ? <EyeIcon className="w-3 h-3" /> : <PowerIcon className="w-3 h-3" />}
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {(activeSection || isProcessing) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[15] bg-black/20 backdrop-blur-[1px] pointer-events-none" />}
            </AnimatePresence>

            {/* Input de Arquivo Oculto */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
            />

            <main ref={mainScrollRef} onClick={() => setActiveSection(null)} className={`relative z-20 flex-1 h-full overflow-y-auto pb-40 custom-scrollbar pr-[460px] space-y-12 transition-all duration-700 ${isFocusMode ? 'pt-10' : 'pt-[120px]'} ${isProcessing ? 'blur-[4px] opacity-40' : ''}`}>

                {/* 1. STUDY FILES */}
                <section onClick={(e) => { e.stopPropagation(); setActiveSection('study'); }} className={`relative rounded-[41px] p-[1px] transition-all ${activeSection === 'study' ? 'z-[30]' : 'z-[10]'}`}>
                    <div className={`relative p-6 rounded-[40px] border transition-all ${activeSection === 'study' ? 'border-cyan-500 shadow-2xl bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="bg-cyan-500 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">{t("homework.study_title")}</span>
                            <ActionButton icon={PlusIcon} label={t("homework.add_files")} onClick={() => fileInputRef.current?.click()} />
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
                        {activeFileContext ? "Contexto Carregado. Pronto para citar." : t("homework.citations_empty")}
                    </div>
                </section>

                {/* 3. VIDEOS (COM NOVO BOTÃO SPARKLE) */}
                <section onClick={(e) => { e.stopPropagation(); setActiveSection('videos'); }} className={`relative rounded-[40px] p-6 border transition-all ${activeSection === 'videos' ? 'border-cyan-400 shadow-2xl z-[30] bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-slate-500 dark:text-cyan-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><VideoCameraIcon className="w-5 h-5" /> {t("homework.videos_title")}</span>
                        <div className="flex items-center gap-2">
                            {/* Botão de Colar Link */}
                            <ActionButton icon={ClipboardIcon} label={t("homework.paste_link")} onClick={handlePasteVideo} />
                            {/* NOVO: Botão Sparkle */}
                            <ActionButton icon={SparklesIcon} label="Insights de Vídeo" onClick={() => alert("Em breve: Análise de vídeo!")} colorClass="text-purple-500 hover:text-purple-600" />
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

                {/* 4. SPECIALISTS CHAT CARDS (COM EFEITO DE FOCO) */}
                <section className="grid grid-cols-2 gap-6 pb-20">
                    {[1, 2].map((num) => {
                        // Verifica se este card específico está ativo
                        const isActive = activeSection === `specialist-${num}`;

                        return (
                            <div
                                key={num}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSection(`specialist-${num}`);
                                }}
                                className={`relative rounded-[40px] border shadow-sm h-[600px] flex flex-col overflow-hidden transition-all duration-500
                                    ${isActive
                                    ? 'z-[30] border-cyan-500 shadow-2xl scale-[1.01] bg-white dark:bg-[#0f172a]'
                                    : 'z-[10] border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] hover:shadow-xl'
                                }
                                `}
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                                    <div>
                                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                            Especialista {num}
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2">
                                            {num === 1 ? "Suporte Acadêmico" : "Revisor Técnico"}
                                        </h3>
                                    </div>
                                    <UserCircleIcon className="w-8 h-8 text-slate-300" />
                                </div>
                                <div className="flex-1 bg-slate-50/30 dark:bg-black/20 p-6 flex items-center justify-center">
                                    <div className="text-center space-y-2 opacity-40">
                                        <PaperAirplaneIcon className="w-8 h-8 mx-auto text-slate-400" />
                                        <p className="text-xs text-slate-500">Inicie uma conversa com o Especialista {num}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-white/5">
                                    <div className="relative flex items-center">
                                        <input type="text" placeholder="Digite sua mensagem..." className="w-full bg-slate-100 dark:bg-white/5 rounded-full py-3 px-5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300 text-slate-700 dark:text-white" />
                                        <button onClick={() => handleSpecialistChat(num)} className="absolute right-2 p-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-transform"><PaperAirplaneIcon className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

            </main>

            {/* CHAT ASIDE */}
            <aside className={`fixed right-6 z-[60] w-[420px] bg-slate-50 shadow-2xl rounded-[40px] flex flex-col border border-slate-200 transition-all duration-700 ${isFocusMode ? 'top-6 h-[calc(100vh-48px)]' : 'top-[123px] h-[calc(100vh-155px)]'}`}>
                <div className="p-8 border-b border-slate-200 flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isProcessing || isTyping ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("homework.chat_header")}</span>
                    </div>
                    {activeFileContext && <span className="text-[8px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded border border-cyan-200">Contexto Ativo</span>}
                </div>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-10 space-y-6 text-slate-800 text-[14px] leading-relaxed custom-scrollbar">
                    {chatHistory.length === 0 && !isProcessing && (
                        <div className="text-center text-slate-400 text-xs italic mt-20">
                            Adicione um PDF e clique no Play para começar.
                        </div>
                    )}

                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`p-5 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-50 ml-4 text-right' : 'bg-white mr-4 shadow-sm text-left'}`}>
                            {msg.text}
                        </div>
                    ))}

                    {(isProcessing || isTyping) && (
                        <div className="flex justify-center p-4">
                            <IosLoader status={isProcessing ? "Lendo Documento..." : "Digitando..."} />
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-100 bg-white rounded-b-[40px]">
                    <div className="relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUserQuestion()}
                            placeholder={activeFileContext ? "Pergunte sobre o documento..." : "Selecione e dê play em um documento primeiro"}
                            disabled={isProcessing}
                            className="w-full bg-white border border-slate-300 rounded-2xl py-4 px-6 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleUserQuestion}
                            disabled={isTyping || isProcessing || !prompt.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black rounded-xl text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}