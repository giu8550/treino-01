"use client";

import { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { motion } from 'framer-motion';
import { TrashIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import '@react-pdf-viewer/core/lib/styles/index.css';

interface PDFCardProps {
    fileUrl: string;
    title: string;
    onDelete: () => void;
}

export default function ResearchCardPDF({ fileUrl, title, onDelete }: PDFCardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <motion.div className="flex-shrink-0 w-[240px] h-[320px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative">
            <div className="h-9 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-3">
                <span className="text-[8px] font-mono text-slate-500 dark:text-cyan-400 truncate uppercase tracking-widest font-bold max-w-[140px]">{title}</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 hover:bg-red-500/10 rounded transition-colors group/trash"
                        title="Remover arquivo"
                    >
                        <TrashIcon className="w-3.5 h-3.5 text-red-500/40 group-hover/trash:text-red-500" />
                    </button>
                    <ArrowsPointingOutIcon className="w-3.5 h-3.5 text-slate-300" />
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-black pointer-events-none">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <Viewer fileUrl={fileUrl} defaultScale={0.3} theme="dark" />
                </Worker>
            </div>
        </motion.div>
    );
}