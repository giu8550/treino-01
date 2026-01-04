"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    PlusIcon, ChevronRightIcon, BookmarkIcon,
    ArrowPathIcon, VideoCameraIcon, ClipboardIcon,
    SparklesIcon, TrashIcon, PowerIcon, EyeIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";
import ResearchCardPDF from "@/components/ui/ResearchCardPDF";

interface StudyDoc { id: string; title: string; url: string; }
interface VideoItem { id: string; youtubeId: string; }

export default function HomeworkPage() {
    const [studyFiles, setStudyFiles] = useState<StudyDoc[]>([]);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Conexão real com modelo Google via API
    const handleSend = async () => {
        if(!prompt.trim()) return;
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
            setChatHistory(prev => [...prev, { role: 'ai', text: "⚠️ Erro: Conexão neural falhou." }]);
        } finally { setIsTyping(false); }
    };

    // NOVO: Destaque Cianeto Estático (Sem animação de giro)
    const StaticCyanHighlight = ({ isActive }: { isActive: boolean }) => (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 -z-10 rounded-[41px] border-[2px] border-cyan-500/50 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                />
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative w-full h-screen bg-[#f0f4f8] dark:bg-[#030014] overflow-hidden flex flex-row transition-colors duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-100">
                <MatrixRain />
            </div>

            {/* Overlay de Sombra Global */}
            <div className="absolute inset-0 z-5 bg-black/20 pointer-events-none" />

            <main onClick={() => setActiveSection(null)} className="relative z-10 flex-1 h-full overflow-y-auto pt-[120px] pl-10 pb-20 custom-scrollbar pr-[460px] space-y-8">

                {/* 1. STUDY FILES (Azul Cianeto Degrade Estático) */}
                <section onClick={(e) => { e.stopPropagation(); setActiveSection('study'); }} className="relative group rounded-[41px] p-[1px]">
                    <StaticCyanHighlight isActive={activeSection === 'study'} />
                    <div className={`relative z-10 h-full p-6 rounded-[40px] transition-all duration-300 border ${
                        activeSection === 'study' ? 'border-cyan-400' : 'border-slate-200 dark:border-white/10'
                    } bg-slate-100/95 dark:bg-gradient-to-br dark:from-[#0a1a2f] dark:to-[#030014] backdrop-blur-xl`}>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="bg-cyan-500 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-cyan-500/20">Study Files</span>
                            <button onClick={() => {/* import logic */}} className="p-2 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-cyan-500 hover:text-white transition-all"><PlusIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-[300px]">
                            {studyFiles.map(doc => (
                                <ResearchCardPDF key={doc.id} title={doc.title} fileUrl={doc.url} onDelete={() => {}} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. AI CITATIONS (Estilo Clean) */}
                <section onClick={(e) => { e.stopPropagation(); setActiveSection('citations'); }} className="relative group rounded-[41px] p-[1px]">
                    <StaticCyanHighlight isActive={activeSection === 'citations'} />
                    <div className={`relative z-10 h-full p-6 rounded-[40px] border transition-all duration-300 ${
                        activeSection === 'citations' ? 'border-cyan-400' : 'border-slate-200 dark:border-white/10'
                    } bg-slate-100/95 dark:bg-gradient-to-br dark:from-[#0a1a2f] dark:to-[#030014] backdrop-blur-xl`}>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-slate-500 dark:text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">AI Citations</span>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:text-cyan-500 transition-colors"><ArrowPathIcon className="w-4 h-4" /></button>
                                <button className="p-2 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:text-emerald-500 transition-colors"><BookmarkIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. VIDEOS */}
                <section onClick={(e) => { e.stopPropagation(); setActiveSection('videos'); }} className="relative group rounded-[41px] p-[1px]">
                    <StaticCyanHighlight isActive={activeSection === 'videos'} />
                    <div className={`relative z-10 h-full p-6 rounded-[40px] border transition-all duration-300 ${
                        activeSection === 'videos' ? 'border-cyan-400' : 'border-slate-200 dark:border-white/10'
                    } bg-slate-100/95 dark:bg-gradient-to-br dark:from-[#0a1a2f] dark:to-[#030014] backdrop-blur-xl`}>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-slate-500 dark:text-cyan-400/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><VideoCameraIcon className="w-4 h-4" /> Videos</span>
                            <button onClick={() => {/* paste logic */}} className="p-2 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:text-cyan-500 transition-all"><ClipboardIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- CHAT LATERAL (BRANCO GELO / PAPEL) --- */}
            {/* Forçado para bg-slate-50 e texto escuro para legibilidade de papel */}
            <aside className="fixed right-6 z-50 w-[420px] bg-slate-50 shadow-2xl rounded-[40px] flex flex-col border border-slate-200 top-[123px] h-[calc(100vh-155px)] transition-all">
                <div className="p-8 border-b border-slate-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_cyan]" />
                </div>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-10 space-y-6 text-slate-800 text-[14px] leading-relaxed font-serif custom-scrollbar">
                    {chatHistory.length === 0 && <div className="text-slate-400 italic">Diga algo para iniciar a síntese neural...</div>}
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-50 text-cyan-800 border border-cyan-100' : 'bg-white border border-slate-100 shadow-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && <div className="text-cyan-600 text-xs animate-pulse">Zaeon processando...</div>}
                </div>

                <div className="p-8 bg-white rounded-b-[40px] border-t border-slate-100">
                    <div className="relative">
                        {/* Input com linha preta */}
                        <input
                            type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Perguntar..."
                            className="w-full bg-white border border-black rounded-2xl py-4 px-6 text-[14px] text-black focus:outline-none transition-all shadow-sm"
                        />
                        <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black rounded-xl text-white hover:bg-slate-800 transition-colors"><ChevronRightIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            </aside>
        </div>
    );
}