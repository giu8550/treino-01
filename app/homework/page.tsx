"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/src/i18n";
import {
    PlusIcon, ChevronRightIcon, BookmarkIcon, ArrowPathIcon,
    VideoCameraIcon, ClipboardIcon, SparklesIcon, TrashIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";
import ResearchCardPDF from "@/components/ui/ResearchCardPDF";

interface StudyDoc { id: string; title: string; url: string; }
interface VideoItem { id: string; youtubeId: string; }

const IosLoader = ({ status }: { status: string }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-10 h-10">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-[3px] h-[10px] bg-slate-400 rounded-full"
                    style={{ left: "50%", top: "30%", transformOrigin: "50% 200%", rotate: i * 45 }}
                    animate={{ opacity: [0.1, 1, 0.1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                />
            ))}
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse text-center">
            {status}
        </span>
    </div>
);

export default function HomeworkPage() {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [studyFiles, setStudyFiles] = useState<StudyDoc[]>([]);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<{role: 'ai', text: string}[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [prompt, setPrompt] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const citationsRef = useRef<HTMLElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // --- LOGICA DE INTERAÇÃO COM O CHAT (RESTAURADA) ---
    const handleUserQuestion = async () => {
        if(!prompt.trim()) return;
        const currentPrompt = prompt;
        setPrompt(""); // Limpa o input imediatamente
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentPrompt, agent: "zenita" })
            });
            const data = await response.json();

            // Adiciona apenas o insight da IA ao histórico
            setChatHistory(prev => [...prev, { role: 'ai', text: data.text }]);
        } catch (e) {
            console.error("Erro na conexão neural:", e);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).filter(f => f.type === 'application/pdf').map(file => ({
            id: crypto.randomUUID(), title: file.name, url: URL.createObjectURL(file)
        }));
        setStudyFiles(prev => [...prev, ...newFiles]);
        setActiveSection('study');
    };

    const handlePasteVideo = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = text.match(regex);
            if (match && match[1]) setVideos(prev => [{ id: crypto.randomUUID(), youtubeId: match[1] }, ...prev]);
        } catch (err) { console.error("Clipboard error"); }
    };

    const handlePlayDocument = async (doc: StudyDoc) => {
        setIsProcessing(true);
        setActiveSection(null);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `Analyze the document ${doc.title}`, agent: "zenita" })
            });
            const data = await response.json();
            setChatHistory(prev => [...prev, { role: 'ai', text: `[INSIGHT: ${doc.title}]\n\n${data.text}` }]);

            setTimeout(() => {
                setIsProcessing(false);
                setActiveSection('citations');
                citationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 800);
        } catch (e) { setIsProcessing(false); }
    };

    const ActionButton = ({ icon: Icon, label, onClick, colorClass = "hover:text-cyan-500" }: any) => (
        <div className="group relative flex flex-col items-center">
            <button onClick={(e) => { e.stopPropagation(); onClick(e); }} className={`p-2 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full transition-all ${colorClass}`}>
                <Icon className="w-4 h-4" />
            </button>
            <span className="absolute -top-8 scale-0 group-hover:scale-100 transition-all bg-slate-800 text-white text-[9px] px-2 py-1 rounded font-bold uppercase whitespace-nowrap z-[100] shadow-xl">
                {label}
            </span>
        </div>
    );

    if (!mounted) return <div className="w-full h-screen bg-[#f0f4f8] dark:bg-[#030014]" />;

    return (
        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} className="relative w-full h-screen bg-[#f0f4f8] dark:bg-[#030014] overflow-hidden flex flex-row transition-colors duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20"><MatrixRain /></div>

            <AnimatePresence>
                {(activeSection || isProcessing) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[15] bg-black/20 backdrop-blur-[1px] pointer-events-none" />
                )}
            </AnimatePresence>

            <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" multiple onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />

            <main onClick={() => setActiveSection(null)} className={`relative z-20 flex-1 h-full overflow-y-auto pt-[120px] pl-10 pb-40 custom-scrollbar pr-[460px] space-y-12 transition-all duration-700 ${isProcessing ? 'blur-[4px] opacity-40' : ''}`}>

                {/* 1. STUDY FILES */}
                <section onClick={(e) => { e.stopPropagation(); setActiveSection('study'); }} className={`relative rounded-[41px] p-[1px] transition-all duration-500 ${activeSection === 'study' ? 'z-[35]' : 'z-[10]'}`}>
                    <div className={`relative p-6 rounded-[40px] border transition-all duration-300 ${activeSection === 'study' ? 'border-cyan-500 shadow-2xl bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="bg-cyan-500 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest">{t("homework.study_title")}</span>
                            <ActionButton icon={PlusIcon} label={t("homework.add_files")} onClick={() => fileInputRef.current?.click()} />
                        </div>
                        <div className="flex flex-row gap-6 overflow-x-auto pb-4 min-h-[300px]">
                            {studyFiles.map(doc => (
                                <ResearchCardPDF key={doc.id} title={doc.title} fileUrl={doc.url} onDelete={() => setStudyFiles(prev => prev.filter(f => f.id !== doc.id))} onPlay={() => handlePlayDocument(doc)} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. AI CITATIONS */}
                <section ref={citationsRef} onClick={(e) => { e.stopPropagation(); setActiveSection('citations'); }} className={`relative rounded-[41px] p-[1px] transition-all duration-500 ${activeSection === 'citations' ? 'z-[35]' : 'z-[10]'}`}>
                    <div className={`relative p-6 rounded-[40px] border transition-all duration-300 ${activeSection === 'citations' ? 'border-cyan-500 shadow-2xl bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                        <div className="flex items-center justify-between mb-4 pr-4">
                            <span className="text-slate-500 dark:text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">{t("homework.citations_title")}</span>
                            <div className="flex gap-2">
                                <ActionButton icon={ArrowPathIcon} label={t("homework.reload")} onClick={() => {}} />
                                <ActionButton icon={BookmarkIcon} label={t("homework.save_all")} onClick={() => {}} colorClass="hover:text-emerald-500" />
                            </div>
                        </div>
                        <div className="h-[100px] bg-slate-50/50 dark:bg-black/20 rounded-2xl flex items-center justify-center italic text-slate-400 text-xs">{t("homework.citations_empty")}</div>
                    </div>
                </section>

                {/* 3. VIDEOS */}
                <section onClick={(e) => { e.stopPropagation(); setActiveSection('videos'); }} className={`relative rounded-[41px] p-[1px] transition-all duration-500 ${activeSection === 'videos' ? 'z-[35]' : 'z-[10]'}`}>
                    <div className={`relative p-6 rounded-[40px] border transition-all duration-300 ${activeSection === 'videos' ? 'border-cyan-400 shadow-2xl bg-white' : 'border-slate-200 bg-slate-100/95 dark:bg-[#0f172a]/90'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-slate-500 dark:text-cyan-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <VideoCameraIcon className="w-5 h-5" /> {t("homework.videos_title")}
                            </span>
                            <div className="flex gap-3">
                                <ActionButton icon={ClipboardIcon} label={t("homework.paste_link")} onClick={handlePasteVideo} />
                                <ActionButton icon={SparklesIcon} label={t("homework.suggest")} onClick={() => {}} colorClass="hover:text-blue-500" />
                            </div>
                        </div>
                        <div className="flex flex-row gap-8 overflow-x-auto pb-6 custom-scrollbar min-h-[300px]">
                            {videos.map(vid => (
                                <div key={vid.id} className="flex-shrink-0 w-[480px] h-[270px] bg-black rounded-[32px] overflow-hidden shadow-2xl relative group/vid border border-white/5">
                                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${vid.youtubeId}`} frameBorder="0" allowFullScreen />
                                    <button onClick={() => setVideos(prev => prev.filter(v => v.id !== vid.id))} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover/vid:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* CHAT DE INSIGHTS */}
            <aside className={`fixed right-6 z-[60] w-[420px] bg-slate-50 shadow-2xl rounded-[40px] flex flex-col border border-slate-200 transition-all duration-700 top-[123px] h-[calc(100vh-155px)] ${
                isProcessing || isTyping ? 'top-10 h-[calc(100vh-60px)] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : ''
            }`}>
                <div className="p-8 border-b border-slate-200 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isProcessing || isTyping ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isProcessing ? t("homework.status_digesting") : t("homework.chat_header")}
                    </span>
                </div>

                <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto p-10 space-y-6 text-slate-800 text-[14px] leading-relaxed font-serif custom-scrollbar">
                    <AnimatePresence>
                        {isProcessing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                                <IosLoader status={t("homework.status_digesting")} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {chatHistory.map((msg, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm italic text-slate-600 animate-in fade-in slide-in-from-right-4 duration-500">
                            {msg.text.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
                        </div>
                    ))}
                    {isTyping && !isProcessing && <div className="text-cyan-600 text-[10px] animate-pulse">{t("homework.status_typing")}</div>}
                </div>

                <div className="p-8 bg-white rounded-b-[40px] border-t border-slate-100">
                    <div className="relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUserQuestion()}
                            placeholder={t("homework.chat_placeholder")}
                            className="w-full bg-white border border-black rounded-2xl py-4 px-6 text-[14px] text-black focus:outline-none shadow-sm"
                        />
                        <button
                            onClick={handleUserQuestion}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black rounded-xl text-white hover:bg-slate-800 transition-colors"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}