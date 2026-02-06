"use client";

import { useEffect, useState } from "react";
import { CalendarDaysIcon, ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface NewsPost {
    id: string;
    title: string;
    subtitle?: string;
    content: string;
    imageUrl?: string;
    publishDate: string;
    status: string;
}

export default function NewsModule() {
    const [news, setNews] = useState<NewsPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedNews, setExpandedNews] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/news');
                const data = await response.json();
                
                // ORDENAÇÃO INTELIGENTE:
                // Garante que o mais recente (maior timestamp) fique no topo (índice 0)
                const sortedData = data.sort((a: NewsPost, b: NewsPost) => 
                    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
                );

                setNews(sortedData);
            } catch (error) {
                console.error("Erro ao carregar notícias:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full pb-20 space-y-4">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-black dark:border-t-white rounded-full animate-spin"/>
        </div>
    );

    return (
        <div className="space-y-8 pb-10 pt-2">
            {/* O Header foi removido conforme solicitado */}

            <div className="grid gap-8">
                {news.length > 0 ? (
                    news.map((item, index) => {
                        const isExpanded = expandedNews === item.id;
                        
                        // Verifica se é "Breaking News" (menos de 3 dias)
                        const isNew = (new Date().getTime() - new Date(item.publishDate).getTime()) / (1000 * 3600 * 24) < 3;

                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={item.id} 
                                className={`group relative overflow-hidden rounded-[2rem] bg-white/60 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 transition-all duration-500 ${isExpanded ? 'ring-2 ring-black/10 dark:ring-white/10 shadow-2xl' : 'hover:shadow-xl'}`}
                            >
                                {/* IMAGEM DE CAPA */}
                                {item.imageUrl && (
                                    <div className="relative w-full h-64 overflow-hidden">
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.title}
                                            className={`w-full h-full object-cover transition-transform duration-1000 ${isExpanded ? 'scale-110 blur-sm' : 'group-hover:scale-105'}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent opacity-90" />
                                        
                                        {/* Badge de Data */}
                                        <div className="absolute top-4 right-4 bg-black/60 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                                            <CalendarDaysIcon className="w-3 h-3 text-white" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                                {new Date(item.publishDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Badge "NEW" se for recente */}
                                        {isNew && (
                                            <div className="absolute top-4 left-4 bg-blue-600 px-3 py-1.5 rounded-full shadow-lg shadow-blue-600/40">
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">New</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-8 relative -mt-12">
                                    {/* TÍTULO E SUBTÍTULO */}
                                    <div className="mb-6">
                                        <h4 className="text-2xl font-black text-[#0f172a] dark:text-white leading-tight mb-2 tracking-tight">
                                            {item.title}
                                        </h4>
                                        {item.subtitle && (
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {item.subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {/* CONTEÚDO EXPANSÍVEL */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 pb-8 border-t border-black/5 dark:border-white/5 text-base text-slate-700 dark:text-slate-300 font-serif leading-loose whitespace-pre-wrap">
                                                    {item.content}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* BOTÃO DE AÇÃO DESTACADO */}
                                    <button 
                                        onClick={() => setExpandedNews(isExpanded ? null : item.id)}
                                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] shadow-lg
                                            ${isExpanded 
                                                ? 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-red-500/10 hover:text-red-500' 
                                                : 'bg-[#0f172a] dark:bg-white text-white dark:text-black hover:scale-[1.02] hover:shadow-xl'
                                            }`}
                                    >
                                        {isExpanded ? (
                                            <>Close Article <XMarkIcon className="w-4 h-4" /></>
                                        ) : (
                                            <>Read Full Story <ArrowRightIcon className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-xs font-bold uppercase tracking-widest">No signals detected.</p>
                    </div>
                )}
            </div>
        </div>
    );
}