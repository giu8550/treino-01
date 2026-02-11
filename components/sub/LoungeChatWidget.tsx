"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChatBubbleLeftRightIcon, 
    MinusIcon, 
    LockClosedIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

// Define que o componente aceita uma prop opcional 'defaultOpen'
interface LoungeChatWidgetProps {
    defaultOpen?: boolean;
}

export const LoungeChatWidget = ({ defaultOpen = false }: LoungeChatWidgetProps) => {
    const { t } = useTranslation();
    
    // Inicializa com o valor passado (false por padrão)
    const [isOpen, setIsOpen] = useState(defaultOpen);

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
                height: isOpen ? 200 : 48, 
                width: isOpen ? 340 : 180 // Mais compacto quando fechado
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed bottom-0 right-8 z-50 rounded-t-2xl flex flex-col ${glassStyle}`}
        >
            {/* --- HEADER --- */}
            <div 
                onClick={() => setIsOpen(!isOpen)} // Clicar no header alterna o estado
                className="h-12 flex items-center justify-between px-4 bg-[#0f172a] dark:bg-white/5 border-b dark:border-white/5 cursor-pointer shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/50 truncate">
                        {isOpen 
                            ? t("lounge_chat.system_restricted", "System Restricted") 
                            : t("lounge_chat.chat", "Global Chat")}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        className="p-1 hover:bg-white/10 rounded text-slate-500 dark:text-white"
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
                            {t("lounge_chat.access_denied", "Access Denied")}
                        </h4>
                        
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
                            {t("lounge_chat.no_credentials", "You don't have enough credentials to access the global chat.")}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};