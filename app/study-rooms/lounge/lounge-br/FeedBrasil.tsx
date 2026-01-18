"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PaperAirplaneIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function FeedBrasil() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Inicial
    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/feed');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Erro ao carregar feed:", error);
        }
    };

    // Efeito de Carregamento Inicial (Simulando conexão com satélite)
    useEffect(() => {
        const init = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Delay estético para o loading
            await fetchPosts();
            setIsLoading(false);
        };
        init();
    }, []);

    // Scroll automático para o topo ao carregar
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [posts]);

    const handlePost = async () => {
        if (!newPost.trim()) return;
        setIsPosting(true);
        try {
            const response = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newPost })
            });

            if (response.ok) {
                setNewPost("");
                await fetchPosts(); // Recarrega o feed
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsPosting(false);
        }
    };

    // TELA DE LOADING ZAEON STYLE
    if (isLoading) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center space-y-6">
                <div className="relative w-16 h-16">
                    <motion.span
                        className="absolute inset-0 border-2 border-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.span
                        className="absolute inset-2 border-2 border-indigo-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] dark:text-white text-slate-900">
                        Establishing Uplink
                    </p>
                    <p className="text-[9px] dark:text-white/40 text-slate-500 font-mono mt-1">
                        Node: Baturité_01 • Latency: 24ms
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col gap-4"
        >
            {/* INPUT AREA */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative p-1 dark:bg-black bg-white rounded-2xl flex items-center gap-2 pr-2 border dark:border-white/10 border-gray-200">
                    <input
                        type="text"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                        placeholder="Transmitir insight para o cluster..."
                        className="flex-1 bg-transparent border-none outline-none text-xs px-4 py-3 dark:text-white text-slate-800 placeholder:text-slate-400"
                        disabled={isPosting}
                    />
                    <button
                        onClick={handlePost}
                        disabled={isPosting}
                        className="p-2 dark:bg-white/10 bg-slate-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        {isPosting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PaperAirplaneIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* POSTS LIST */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 max-h-[400px]"
            >
                {posts.map((post: any) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={post.id}
                        className="p-4 rounded-2xl dark:bg-white/[0.03] bg-white border dark:border-white/5 border-gray-100 hover:dark:bg-white/[0.06] transition-colors"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{post.user}</span>
                            <span className="text-[9px] dark:text-white/20 text-slate-400 font-mono">{post.time}</span>
                        </div>
                        <p className="text-xs leading-relaxed dark:text-white/80 text-slate-600">
                            {post.content}
                        </p>
                    </motion.div>
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-10 opacity-30">
                        <p className="text-[10px] uppercase tracking-widest">Nenhuma transmissão detectada</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}