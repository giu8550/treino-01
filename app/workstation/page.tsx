"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    PaperAirplaneIcon,
    TrashIcon,
    CpuChipIcon,
    PlayIcon,
    ArrowDownTrayIcon,
    AcademicCapIcon,
    CommandLineIcon,
    HeartIcon,
    CalculatorIcon,
    ChevronUpIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";

// --- IMAGE IMPORTS ---
import zoxImage from "./zox.png";
import ethernautImage from "./ethernaut.png";
import ballenaImage from "./ballena.png";

// --- ASSETS: PIXEL PYTHON SVG ---
const PixelPython = ({ color = "#22d3ee" }: { color?: string }) => (
    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
        <path d="M10 4H14V6H16V10H14V8H10V10H8V6H10V4Z" fill={color} />
        <path d="M16 10H18V14H16V16H8V14H6V10H8V12H16V10Z" fill={color} fillOpacity="0.7"/>
        <rect x="9" y="5" width="1" height="1" fill="white" />
        <rect x="13" y="5" width="1" height="1" fill="white" />
    </svg>
);

// --- AGENT CONFIGURATION ---
const AGENTS = {
    zenita: {
        name: "Zenita",
        role: "Technology",
        icon: CommandLineIcon,
        color: "text-cyan-400",
        bg: "bg-cyan-500/20",
        border: "border-cyan-500/50",
        image: zoxImage,
        // Small Size
        widthClass: "w-64",
        contentPadding: "pl-[290px]"
    },
    ballena: {
        name: "Ballena",
        role: "Health",
        icon: HeartIcon,
        color: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500/50",
        image: ballenaImage,
        // Target Size (Medium)
        widthClass: "w-[260px]",
        contentPadding: "pl-[290px]"
    },
    ethernaut: {
        name: "Ethernaut",
        role: "Math",
        icon: CalculatorIcon,
        color: "text-purple-400",
        bg: "bg-purple-500/20",
        border: "border-purple-500/50",
        image: ethernautImage,
        // UPDATED: Now matches Ballena exactly to fit the prompt window
        widthClass: "w-[260px]",
        contentPadding: "pl-[290px]"
    },
};

type AgentKey = keyof typeof AGENTS;

export default function WorkStationPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [activeSection, setActiveSection] = useState<"doc" | "chat" | "terminal" | null>(null);
    const [prompt, setPrompt] = useState("");
    const [docTitle, setDocTitle] = useState("Untitled_Research_Paper.txt");

    const [selectedAgent, setSelectedAgent] = useState<AgentKey>("zenita");
    const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleAgentSwitch = (key: AgentKey) => {
        if (key === selectedAgent) return;
        setIsAgentMenuOpen(false);
        setIsImageLoading(true);
        setSelectedAgent(key);

        setTimeout(() => {
            setIsImageLoading(false);
        }, 600);
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            const { scrollHeight, clientHeight } = chatContainerRef.current;
            chatContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        if (mounted) scrollToBottom();
    }, [chatHistory, mounted, isTyping, selectedAgent]);

    const handleSend = () => {
        if(!prompt.trim()) return;
        setChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
        setPrompt("");
        setIsTyping(true);

        const agent = AGENTS[selectedAgent];
        setTimeout(() => {
            setChatHistory(prev => [...prev, { role: 'ai', text: `${agent.name}: Analyzing inputs... Accessing ${agent.role} database...` }]);
            setIsTyping(false);
        }, 1000);
    };

    if (!mounted) return <div className="w-full h-screen bg-[#030014]" />;

    const panelStyle = "relative overflow-hidden backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(34,211,238,0.12)] bg-[linear-gradient(135deg,rgba(7,38,77,0.4),rgba(11,58,164,0.3),rgba(7,38,77,0.4))] rounded-xl transition-all duration-300";
    const activeBorder = "ring-1 ring-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.25)] bg-[linear-gradient(135deg,rgba(7,38,77,0.6),rgba(11,58,164,0.4),rgba(7,38,77,0.6))]";
    const btnBase = "px-4 py-2 rounded-md text-[11px] font-bold border transition flex items-center gap-2 uppercase tracking-wider";

    const activeConfig = AGENTS[selectedAgent];

    return (
        <div className="relative w-full h-screen bg-[#030014] overflow-hidden flex flex-col justify-end items-center pb-2 px-4">
            <MatrixRain />

            <div className="z-20 w-full max-w-[1700px] h-[88vh] grid grid-cols-12 gap-6">

                {/* --- 1. LEFT SIDE: CHAT WINDOW --- */}
                <div
                    onClick={() => setActiveSection('chat')}
                    className={`col-span-7 ${panelStyle} flex flex-col ${activeSection === 'chat' ? activeBorder : ''} relative h-full`}
                >
                    <AnimatePresence>
                        {activeSection === 'chat' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, y: [0, -5, 0] }} exit={{ opacity: 0, x: -20 }}
                                transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
                                className="absolute -left-3 top-[-10px] z-30 pointer-events-none"
                            >
                                <PixelPython color="#22d3ee" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* --- STATIC VISUALS CONTAINER --- */}
                    {/* Positioned absolutely at bottom left */}
                    <div className="absolute bottom-6 left-6 z-30 flex flex-col items-center">

                        {/* 1. CHARACTER IMAGE */}
                        <div className={`relative transition-all duration-500 ease-in-out flex justify-center items-end ${activeConfig.widthClass} h-auto`}>
                            <AnimatePresence mode="wait">
                                {isImageLoading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="h-48 w-full flex items-center justify-center"
                                    >
                                        <div className="bg-black/40 p-4 rounded-full backdrop-blur-md border border-white/10">
                                            <svg className="animate-spin text-white/50 w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={selectedAgent}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full flex justify-center"
                                    >
                                        <Image
                                            src={activeConfig.image}
                                            alt={activeConfig.name}
                                            className="w-full h-auto object-contain object-bottom drop-shadow-[0_0_35px_rgba(34,211,238,0.25)] max-h-[550px]"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 2. AGENT SELECTOR BUTTON */}
                        <div className="relative mt-2">
                            <AnimatePresence>
                                {isAgentMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-3 flex flex-col gap-2 bg-[#0a0a0a]/95 border border-white/10 rounded-xl p-2 backdrop-blur-xl shadow-2xl min-w-[160px] z-50"
                                    >
                                        {Object.entries(AGENTS).map(([key, agent]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleAgentSwitch(key as AgentKey)}
                                                className={`flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-white/10 ${selectedAgent === key ? 'bg-white/5 ring-1 ring-white/10' : ''}`}
                                            >
                                                <div className={`p-1.5 rounded ${agent.bg} ${agent.color}`}>
                                                    <agent.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-bold text-white tracking-wide">{agent.name}</span>
                                                    <span className="text-[10px] text-white/40 uppercase">{agent.role}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                                disabled={isImageLoading}
                                className="flex items-center gap-3 bg-[#0a0a0a]/60 border border-white/10 hover:border-white/20 hover:bg-[#0a0a0a]/80 backdrop-blur-md rounded-full pl-2 pr-4 py-2 transition-all shadow-lg group disabled:opacity-50"
                            >
                                <div className={`p-1.5 rounded-full ${activeConfig.bg} ${activeConfig.color} ${activeConfig.border} border`}>
                                    {(() => { const Icon = activeConfig.icon; return <Icon className="w-4 h-4" />; })()}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Active Agent</span>
                                    <span className="text-xs font-bold text-white tracking-wide group-hover:text-cyan-200 transition-colors">{activeConfig.name}</span>
                                </div>
                                <ChevronUpIcon className={`w-3 h-3 text-white/30 ml-2 transition-transform duration-300 ${isAgentMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* CHAT CONTENT */}
                    <div ref={chatContainerRef} className="flex-1 relative p-6 overflow-y-auto custom-scrollbar flex flex-col z-0">
                        <div className="flex-1" />
                        <div className="space-y-6 pb-2">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : `justify-start transition-all duration-300 ${activeConfig.contentPadding}`}`}>
                                    <div className={`
                        max-w-[85%] rounded-2xl px-5 py-3 text-sm font-light tracking-wide leading-relaxed shadow-lg relative
                        ${msg.role === 'user' ? 'bg-cyan-900/40 text-cyan-50 border border-cyan-500/30' : 'bg-[#0a0a0a]/80 text-white/90 border border-white/10'}
                      `}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className={`flex justify-start transition-all duration-300 ${activeConfig.contentPadding}`}>
                                    <div className="bg-[#0a0a0a]/60 border border-white/5 px-4 py-2 rounded-xl flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-5 bg-black/60 border-t border-white/10 flex flex-col gap-3 shrink-0 backdrop-blur-xl z-20 relative rounded-b-xl">
                        <div className={`flex gap-3 items-center transition-all duration-300 ${activeConfig.contentPadding}`}>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={`Ask ${activeConfig.name} about ${activeConfig.role.toLowerCase()}...`}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-mono text-sm"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                className="bg-cyan-500 text-black border border-cyan-400 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] h-full px-6 rounded-xl font-bold text-xs tracking-wider flex items-center gap-2 transition-all active:scale-95">
                                SEND <PaperAirplaneIcon className="w-3.5 h-3.5 -rotate-45" />
                            </button>
                        </div>

                        {/* Footer with Padding */}
                        <div className={`flex justify-between items-center px-1 transition-all duration-300 ${activeConfig.contentPadding}`}>
                 <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                    System Status: <span className="text-green-400">ONLINE</span>
                 </span>
                            <button
                                onClick={() => setChatHistory([])}
                                className="text-[10px] text-red-400/50 hover:text-red-400 flex items-center gap-1.5 px-2 py-1 hover:bg-red-900/10 rounded transition-colors uppercase tracking-widest"
                            >
                                <TrashIcon className="w-3 h-3" /> Clear History
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- 2. RIGHT SIDE: DOCUMENT & TERMINAL --- */}
                <div className="col-span-5 flex flex-col gap-4 h-full">

                    <div
                        onClick={() => setActiveSection('doc')}
                        className={`${panelStyle} flex-1 flex flex-col ${activeSection === 'doc' ? activeBorder : ''} group relative`}
                    >
                        <AnimatePresence>
                            {activeSection === 'doc' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="absolute top-4 right-4 z-30 pointer-events-none"
                                >
                                    <PixelPython color="#60a5fa" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="h-14 bg-black/40 border-b border-white/10 flex items-center px-6 shrink-0">
                            <input
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                className="bg-transparent text-white/90 text-sm font-mono focus:outline-none focus:text-cyan-400 w-full border-b border-transparent focus:border-cyan-500/50 transition-colors placeholder:text-white/30"
                                placeholder="Enter Document Title..."
                            />
                        </div>

                        <div className="flex-1 p-8 font-mono text-sm text-white/80 leading-loose overflow-auto custom-scrollbar bg-black/20">
                            <p className="opacity-40 italic">Waiting for generated output...</p>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-3 rounded-b-xl">
                            <button className={`${btnBase} bg-cyan-900/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]`}>
                                <CpuChipIcon className="w-4 h-4" /> APPLY
                            </button>
                            <button className={`${btnBase} bg-green-900/20 text-green-400 border-green-500/30 hover:bg-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]`}>
                                <PlayIcon className="w-4 h-4" /> GENERATE
                            </button>
                        </div>
                    </div>

                    <div className={`${panelStyle} h-[28%] flex flex-col shrink-0`}>
                        <div className="h-9 bg-black/60 border-b border-white/10 flex items-center justify-end px-4 gap-4">
                            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-white/40 hover:text-purple-400 transition">
                                <AcademicCapIcon className="w-3.5 h-3.5" /> Homework
                            </button>
                            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-white/40 hover:text-green-400 transition">
                                <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Save Work
                            </button>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs text-green-500/90 bg-black/60 overflow-hidden shadow-inner rounded-b-xl">
                            <div className="opacity-80 space-y-1">
                                <p>zaeon@user:~$ <span className="animate-pulse">_</span></p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.4); }
      `}</style>
        </div>
    );
}