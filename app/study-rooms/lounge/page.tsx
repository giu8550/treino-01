"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, Reorder } from "framer-motion"; 
import {
    BookOpenIcon, UsersIcon, BeakerIcon,
    XMarkIcon, GlobeAmericasIcon,
    CpuChipIcon, ClipboardDocumentCheckIcon,
    EyeIcon, EyeSlashIcon
} from "@heroicons/react/24/outline";

import { Navbar } from "@/components/main/navbar";
import FeedBrasil from "./lounge-br/FeedBrasil"; 
import { LoungeChatWidget } from "@/components/sub/LoungeChatWidget";

// --- APPLE STYLE LOADING ICON ---
const LoadingIcon = () => (
    <div className="flex flex-col items-center justify-center p-20 w-full h-full">
        <div className="relative w-8 h-8 animate-spin">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-[2px] h-[7px] bg-slate-500 dark:bg-white/40 rounded-full left-1/2 top-0 origin-[0_15px]"
                    style={{ transform: `rotate(${i * 45}deg)`, opacity: 1 - (i * 0.1) }}
                />
            ))}
        </div>
    </div>
);

// --- DYNAMIC IMPORTS ---
const LoungeEarth = dynamic(() => import("@/components/sub/LoungeEarth"), {
    ssr: false,
    loading: () => <div className="w-40 h-40 rounded-full border border-white/5 animate-pulse" />
}) as any;

// Módulos Privados
const ProjectsModule = dynamic(() => import("./main-lounge/projects/page"), { loading: LoadingIcon });
const ExamsModule = dynamic(() => import("./main-lounge/exams/page"), { loading: LoadingIcon });
const LessonsModule = dynamic(() => import("./main-lounge/classes/page"), { loading: LoadingIcon }); 

// Módulos Públicos
// CHANGE: Renamed "NewsModule" import to reflect its new role as "Research", pointing to the previous news folder
const ResearchModule = dynamic(() => import("./main-lounge/researches/page"), { loading: LoadingIcon });

export default function LoungePageUS() {
    // --- 1. CONFIGURAÇÃO DAS ABAS ---
    const [tabs, setTabs] = useState([
        { id: 'lessons', label: 'Classes', icon: <BookOpenIcon className="w-5 h-5" /> },
        { id: 'exams', label: 'Exams', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" /> },
        { id: 'projects', label: 'Projects', icon: <BeakerIcon className="w-5 h-5" /> },
        // CHANGE: "Research" now uses the logic that was previously "News"
        { id: 'research', label: 'Research', icon: <CpuChipIcon className="w-5 h-5" /> },
        { id: 'community', label: 'Community', icon: <UsersIcon className="w-5 h-5" /> },
    ]);

    const [activeTab, setActiveTab] = useState("lessons"); 
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [isFeedActive, setIsFeedActive] = useState(false);
    
    // --- FOCUS MODE STATE ---
    const [isFocusMode, setIsFocusMode] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    const cardStyle = `
        dark:bg-white/[0.05] bg-white/60
        backdrop-blur-[45px] saturate-[1.3]
        border dark:border-white/10 border-white/80
        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]
    `;

    // --- LÓGICA DE RENDERIZAÇÃO ---
    const renderMainContent = () => {
        switch (activeTab) {
            case "community":
                return (
                    <div className="w-full flex flex-col items-center">
                        <motion.div
                            animate={{ scale: isFeedActive ? 0.8 : 1, opacity: isFeedActive ? 0.6 : 1 }}
                            className="w-[380px] h-[380px] shrink-0 relative z-10 my-4"
                        >
                            <LoungeEarth onSelectRegion={(region: string) => setSelectedRegion(region)} />
                        </motion.div>
                        
                        <AnimatePresence mode="wait">
                            {(selectedRegion === 'us' || selectedRegion === 'na') && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
                                    {!isFeedActive ? (
                                        <div className={`p-8 rounded-[2.5rem] ${cardStyle} text-center`}>
                                            <GlobeAmericasIcon className="w-8 h-8 mx-auto text-[#0f172a] dark:text-blue-400 mb-4" />
                                            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Cluster USA</h3>
                                            <button 
                                                onClick={() => setIsFeedActive(true)} 
                                                className="mt-6 px-8 py-3 bg-[#0f172a] text-white dark:bg-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                            >
                                                Connect to Network
                                            </button>
                                        </div>
                                    ) : <FeedBrasil />} 
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            // CHANGE: Maps 'research' tab to the module that was previously 'news'
            case "research":
                return <ResearchModule />;
            case "projects":
                return <ProjectsModule />;
            case "exams":
                return <ExamsModule />;
            default:
                return null;
        }
    };

    return (
        <div className="relative z-0 w-screen h-screen dark:bg-[#010816] bg-[#e2e8f0] transition-colors duration-1000 font-sans overflow-hidden flex flex-col">
            
            {/* CONDITIONAL NAVBAR RENDER */}
            <AnimatePresence>
                {!isFocusMode && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-0 left-0 w-full z-50"
                    >
                        <Navbar />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* CONTAINER: Adjusts padding based on Focus Mode */}
            <motion.div 
                layout 
                className={`flex items-start justify-start px-4 gap-6 w-full h-full relative transition-all duration-700 ${isFocusMode ? 'pt-4' : 'pt-32'}`}
            >
                
                {/* --- SIDEBAR --- */}
                <motion.aside
                    layout
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                    className={`z-10 rounded-[2.5rem] ${cardStyle} transition-all duration-500 flex flex-col items-center py-6 gap-4 
                        ${isSidebarExpanded ? 'w-64 px-6' : 'w-20'}
                        ${isFocusMode ? 'h-[96vh]' : 'h-[70vh]'} 
                    `}
                >
                    <Reorder.Group 
                        axis="y" 
                        values={tabs} 
                        onReorder={setTabs} 
                        className="flex flex-col gap-2 w-full flex-1 justify-center"
                    >
                        {tabs.map((item) => (
                            <Reorder.Item 
                                key={item.id} 
                                value={item}
                                whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                                className="relative z-20"
                            >
                                <SidebarItem 
                                    icon={item.icon} 
                                    label={item.label} 
                                    active={activeTab === item.id} 
                                    expanded={isSidebarExpanded} 
                                    onClick={() => setActiveTab(item.id)} 
                                />
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    {/* FOCUS MODE TOGGLE BUTTON */}
                    <div className="w-full pt-4 border-t dark:border-white/10 border-black/5 mt-auto">
                        <button 
                            onClick={() => setIsFocusMode(!isFocusMode)}
                            className={`flex items-center gap-5 w-full p-4 rounded-2xl transition-all 
                                ${isFocusMode 
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                                    : 'dark:text-white/40 text-slate-500 hover:dark:text-white hover:text-[#0f172a]'}`}
                        >
                            <div className="shrink-0">
                                {isFocusMode ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </div>
                            {isSidebarExpanded && (
                                <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-[10px] font-black uppercase tracking-widest truncate"
                                >
                                    {isFocusMode ? "Exit Focus" : "Focus Mode"}
                                </motion.span>
                            )}
                        </button>
                    </div>

                </motion.aside>

                {/* --- MAIN CONTENT AREA --- */}
                <motion.main 
                    layout
                    className={`z-10 flex-1 rounded-[3.5rem] ${cardStyle} overflow-hidden flex flex-col relative transition-all duration-700
                        ${isFocusMode ? 'h-[96vh]' : 'h-[82vh]'}
                    `}
                >
                    <div className="p-10 pb-4 flex justify-between items-center border-b dark:border-white/5 border-black/5">
                        <h2 className="text-xl font-black uppercase tracking-[0.3em] dark:text-white text-[#0f172a] leading-none">
                            {tabs.find(t => t.id === activeTab)?.label || activeTab}
                        </h2>
                        {selectedRegion && activeTab === 'community' && (
                            <button onClick={() => setSelectedRegion(null)} className="flex items-center gap-2 px-4 py-1.5 dark:bg-white/10 bg-[#0f172a] rounded-full text-[9px] font-black text-white uppercase tracking-widest hover:scale-105 transition-all">
                                <XMarkIcon className="w-4 h-4" /> Reset Orbit
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 pt-6 relative">
                        
                        {/* KEEP ALIVE FOR LESSONS */}
                        <div className={`${activeTab === 'lessons' ? 'block' : 'hidden'} h-full w-full`}>
                            <LessonsModule />
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab !== 'lessons' && (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    {renderMainContent()}
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </motion.main>

                <LoungeChatWidget />
                
            </motion.div>
        </div>
    );
}

function SidebarItem({ icon, label, active, expanded, onClick }: any) {
    return (
        <button 
            onPointerDown={(e) => onClick()}
            className={`flex items-center gap-5 w-full p-4 rounded-2xl transition-all cursor-grab active:cursor-grabbing
            ${active
            ? 'dark:bg-white/10 bg-[#0f172a] text-white shadow-lg border dark:border-white/10 border-transparent'
            : 'dark:text-white/40 text-slate-500 hover:dark:text-white hover:text-[#0f172a]'}`}
        >
            <div className="shrink-0">{icon}</div>
            {expanded && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-black uppercase tracking-widest truncate">{label}</motion.span>}
        </button>
    );
}