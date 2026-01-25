"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChatBubbleLeftRightIcon, 
    MinusIcon, 
    LockClosedIcon
} from "@heroicons/react/24/outline";

export const LoungeChatWidget = () => {
    // Mantemos apenas o estado de abrir/fechar, pois o conteúdo é estático
    const [isOpen, setIsOpen] = useState(true);

    const glassStyle = `
        dark:bg-[#0f172a]/95 bg-white/90
        backdrop-blur-xl border dark:border-white/10 border-slate-200
        shadow-2xl overflow-hidden
    `;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
                y: 0, 
                opacity: 1, 
                // Altura reduzida pois não há lista para rolar
                height: isOpen ? 200 : 48, 
                width: isOpen ? 340 : 280 
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed bottom-0 right-8 z-50 rounded-t-2xl flex flex-col ${glassStyle}`}
        >
            {/* --- HEADER --- */}
            <div 
                onClick={() => !isOpen && setIsOpen(true)}
                className="h-12 flex items-center justify-between px-4 bg-[#0f172a] dark:bg-white/5 border-b dark:border-white/5 cursor-pointer shrink-0"
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {/* Status Vermelho (Offline) */}
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white/50">
                        {isOpen ? "System Restricted" : "Chat Offline"}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        className="p-1 hover:bg-white/10 rounded text-white"
                    >
                        {isOpen ? <MinusIcon className="w-4 h-4" /> : <ChatBubbleLeftRightIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* --- CONTENT (LOCKED VIEW) --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 dark:bg-black/20"
                    >
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                            <LockClosedIcon className="w-6 h-6 text-red-500" />
                        </div>
                        
                        <h4 className="text-sm font-bold text-[#0f172a] dark:text-white mb-1">
                            Access Denied
                        </h4>
                        
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
                            You don&apos;t have enough credentials to access the global chat.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};