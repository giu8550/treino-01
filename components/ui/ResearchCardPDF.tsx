"use client";

import { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
// CORREÇÃO TS1484: Importação separada para tipos puros
import type { DocumentLoadEvent } from '@react-pdf-viewer/core';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlayIcon } from '@heroicons/react/24/solid';

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

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex-shrink-0 w-[240px] h-[320px] bg-white dark:bg-[#0f172a] border rounded-2xl overflow-hidden shadow-xl flex flex-col group relative transition-all duration-500
                ${isProcessing ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/20' : 'border-slate-200 dark:border-white/10'}`}>

            {/* PROGRESS SCANNER */}
            <div className="h-0.5 w-full bg-transparent overflow-hidden z-30">
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                    className="h-full w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    )}
                </AnimatePresence>
            </div>

            <div className="h-9 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-3 z-20">
                <span className="text-[8px] font-mono text-slate-500 dark:text-cyan-400 truncate uppercase font-bold max-w-[140px]">{title}</span>
                {!isProcessing && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:bg-red-500/10 rounded transition-colors group/trash">
                        <TrashIcon className="w-3.5 h-3.5 text-red-500/40 group-hover/trash:text-red-500" />
                    </button>
                )}
            </div>

            <div className={`flex-1 relative transition-all duration-500 ${isProcessing ? 'blur-[3px] grayscale opacity-40' : 'opacity-70 group-hover:opacity-100'}`}>
                {hasError ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 italic">Preview Indisponível</div>
                ) : (
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        {/* CORREÇÃO TS2769: Tipagem explícita nos eventos do Viewer */}
                        <Viewer
                            fileUrl={fileUrl}
                            defaultScale={0.3}
                            onDocumentLoad={(e: DocumentLoadEvent) => {
                                console.log(`PDF OK: ${e.doc.numPages} pgs`);
                                setHasError(false);
                            }}
                            renderError={() => {
                                setHasError(true);
                                return (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 italic">
                                        Preview Indisponível
                                    </div>
                                );
                            }}
                        />
                    </Worker>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 bg-white/10 backdrop-blur-[1px]">
                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest animate-pulse">Digerindo...</span>
                    </div>
                )}

                {!isProcessing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/5 backdrop-blur-[2px]">
                        <button onClick={(e) => { e.stopPropagation(); onPlay(); }} className="p-4 bg-cyan-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                            <PlayIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}