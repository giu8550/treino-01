"use client";

import { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import type { DocumentLoadEvent } from '@react-pdf-viewer/core';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlayIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

// Estilos obrigatórios do visualizador
import '@react-pdf-viewer/core/lib/styles/index.css';

interface PDFCardProps {
    fileUrl: string;
    title: string;
    onDelete: () => void;
    onPlay: () => void;
    isProcessing?: boolean;
}

export default function ResearchCardPDF({ fileUrl, title, onDelete, onPlay, isProcessing }: PDFCardProps) {
    const [mounted, setMounted] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Limpeza de memória essencial para evitar vazamentos
        return () => {
            if (fileUrl && fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    if (!mounted) return null;

    // Componente de Fallback (Mostra ícone elegante se a prévia falhar)
    const PDFPlaceholder = () => (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 opacity-50">
            <DocumentTextIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-2" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">PDF Preview</span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex-shrink-0 w-[240px] h-[320px] bg-white dark:bg-[#0f172a] border rounded-2xl overflow-hidden shadow-xl flex flex-col group relative transition-all duration-500
            ${isProcessing ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/20' : 'border-slate-200 dark:border-white/10'}`}
        >

            {/* PROGRESS BAR DO SCANNER */}
            <div className="h-0.5 w-full bg-transparent overflow-hidden z-[60]">
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                            className="h-full w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* HEADER DO CARD */}
            <div className="h-9 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-3 z-50">
                <span className="text-[8px] font-mono text-slate-500 dark:text-cyan-400 truncate uppercase font-bold max-w-[140px]">{title}</span>
                {!isProcessing && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 hover:bg-red-500/10 rounded transition-colors group/trash cursor-pointer"
                    >
                        <TrashIcon className="w-3.5 h-3.5 text-red-500/40 group-hover/trash:text-red-500" />
                    </button>
                )}
            </div>

            {/* ÁREA DO PDF / VIEWER */}
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#0f172a]">
                <div className={`w-full h-full transition-all duration-500 ${isProcessing ? 'blur-[3px] grayscale opacity-40' : 'opacity-100'}`}>

                    {hasError ? (
                        <PDFPlaceholder />
                    ) : (
                        // --- CORREÇÃO CRÍTICA AQUI ---
                        // Usando exatamente a versão 3.4.120 que está no seu package-lock
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                            <Viewer
                                fileUrl={fileUrl}
                                defaultScale={0.4}
                                theme={{ theme: 'dark' }} // Adapta para modo escuro se necessário
                                onDocumentLoad={(e: DocumentLoadEvent) => {
                                    setHasError(false);
                                }}
                                renderError={() => {
                                    setHasError(true);
                                    // Retorna div vazia para não quebrar layout; o Placeholder assume via state
                                    return <div />;
                                }}
                                renderLoader={() => (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-slate-200 border-t-cyan-500 rounded-full animate-spin" />
                                    </div>
                                )}
                            />
                        </Worker>
                    )}
                </div>

                {/* OVERLAY "DIGERINDO..." */}
                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center z-[55] bg-white/10 dark:bg-black/20 backdrop-blur-[1px]">
                        <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest animate-pulse">Digerindo...</span>
                    </div>
                )}

                {/* BOTÃO PLAY (Sempre disponível no Hover) */}
                {!isProcessing && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/10 backdrop-blur-[2px] pointer-events-none group-hover:pointer-events-auto">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPlay();
                            }}
                            className="p-4 bg-cyan-500 text-white rounded-full shadow-2xl transform scale-90 group-hover:scale-100 hover:bg-cyan-400 active:scale-90 transition-all pointer-events-auto cursor-pointer"
                        >
                            <PlayIcon className="w-8 h-8" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}