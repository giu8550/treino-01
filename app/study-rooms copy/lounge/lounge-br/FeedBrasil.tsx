"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    PaperAirplaneIcon,
    ArrowPathIcon,
    ChatBubbleOvalLeftIcon,
    TrashIcon,
    HeartIcon,
    UserCircleIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeaartSolidIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

export default function FeedBrasil() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [expandedComments, setExpandedComments] = useState<string | null>(null);
    const [commentText, setCommentText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/feed');
            if (res.ok) {
                const data = await res.json();
                setPosts(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Erro ao carregar feed:", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            // Delay estético para o loading Apple-style
            await new Promise(resolve => setTimeout(resolve, 2000));
            await fetchPosts();
            setIsLoading(false);
        };
        init();
    }, []);

    const handlePost = async () => {
        if (!newPost.trim() || isPosting) return;
        setIsPosting(true);
        try {
            const response = await fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newPost })
            });
            if (response.ok) {
                setNewPost("");
                await fetchPosts();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Deseja deletar esta transmissão?")) return;
        try {
            const res = await fetch(`/api/feed?id=${postId}`, { method: 'DELETE' });
            if (res.ok) await fetchPosts();
        } catch (err) {
            console.error("Erro ao deletar:", err);
        }
    };

    const handleComment = async (postId: string) => {
        if (!commentText.trim()) return;
        try {
            const res = await fetch(`/api/feed/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, content: commentText })
            });
            if (res.ok) {
                setCommentText("");
                await fetchPosts();
            }
        } catch (err) {
            console.error("Erro ao comentar:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[400px] flex flex-col items-center justify-center">
                <div className="relative w-8 h-8">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-[2px] h-[7px] bg-slate-400 dark:bg-white rounded-full left-[15px] top-0 origin-[1px_16px]"
                            style={{ rotate: `${i * 30}deg` }}
                            animate={{ opacity: [0.1, 1, 0.1] }}
                            transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: i * 0.083
                            }}
                        />
                    ))}
                </div>
                <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.4em] opacity-40 animate-pulse">
                    Synchronizing Feed
                </p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col gap-4">

            {/* AREA DE INPUT */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-50"></div>
                <div className="relative p-1 dark:bg-black bg-white rounded-2xl flex items-center gap-2 border dark:border-white/10 border-gray-200 shadow-sm">
                    <input
                        type="text"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                        placeholder="Transmitir insight para o cluster..."
                        className="flex-1 bg-transparent border-none outline-none text-[13px] px-4 py-3 dark:text-white text-slate-800 placeholder:text-slate-400"
                        disabled={isPosting}
                    />
                    <button
                        onClick={handlePost}
                        disabled={isPosting}
                        className="p-2.5 dark:bg-white/5 bg-slate-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                    >
                        {isPosting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PaperAirplaneIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* LISTA DE TRANSMISSÕES */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 max-h-[500px]">
                {posts.map((post: any) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={post.id}
                        className="p-4 rounded-2xl dark:bg-white/[0.03] bg-white border dark:border-white/5 border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-500/20 bg-slate-800 flex-shrink-0">
                                    {post.userImage ? (
                                        <img
                                            src={post.userImage}
                                            alt={post.user}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <UserCircleIcon className="w-full h-full text-white/20" />
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-tighter">
                                            {post.user}
                                        </span>
                                        {session?.user?.name === post.user && (
                                            <span className="text-[8px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded uppercase font-bold">You</span>
                                        )}
                                    </div>
                                    <span className="text-[9px] opacity-30 font-mono">{post.time}</span>
                                </div>
                            </div>

                            {session?.user?.name === post.user && (
                                <button onClick={() => handleDelete(post.id)} className="hover:text-red-500 transition-colors p-1">
                                    <TrashIcon className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                                </button>
                            )}
                        </div>

                        <p className="text-[13px] leading-relaxed dark:text-white/80 text-slate-600 mb-4 ml-11">
                            {post.content}
                        </p>

                        <div className="flex items-center gap-4 pt-3 border-t dark:border-white/5 border-gray-50 ml-11">
                            <button className="flex items-center gap-1.5 text-[10px] opacity-50 hover:opacity-100 transition-opacity">
                                <HeartIcon className="w-4 h-4" />
                                <span>{post.likes?.length || 0}</span>
                            </button>
                            <button
                                onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                                className="flex items-center gap-1.5 text-[10px] opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                                <span>{post.comments?.length || 0}</span>
                            </button>
                        </div>

                        {/* SEÇÃO DE RESPOSTAS */}
                        <AnimatePresence>
                            {expandedComments === post.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden ml-11"
                                >
                                    <div className="pt-4 space-y-3">
                                        {(post.comments || []).map((c: any, i: number) => (
                                            <div key={i} className="pl-4 border-l-2 border-blue-500/20">
                                                <p className="text-[10px] font-bold text-blue-400/60 mb-0.5">{c.user}</p>
                                                <p className="text-[11px] opacity-70">{c.content}</p>
                                            </div>
                                        ))}

                                        <div className="flex gap-2 pt-2">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                placeholder="Adicionar resposta..."
                                                className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-[11px] outline-none border border-white/5 focus:border-blue-500/30 font-medium"
                                            />
                                            <button
                                                onClick={() => handleComment(post.id)}
                                                className="p-2 bg-blue-500 rounded-lg text-white"
                                            >
                                                <PaperAirplaneIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}