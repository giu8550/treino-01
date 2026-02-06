"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ChartBarIcon, IdentificationIcon, CurrencyDollarIcon,
    ShieldCheckIcon, ArrowLeftIcon, 
    SparklesIcon, DocumentChartBarIcon,
    PhoneIcon, ChatBubbleLeftEllipsisIcon, DocumentTextIcon,
    ServerIcon, SunIcon, MoonIcon,
    PlusIcon, PhotoIcon, CalendarDaysIcon, GlobeAmericasIcon, 
    TrashIcon
} from "@heroicons/react/24/outline";
import MatrixRain from "@/components/main/star-background";

// --- APPLE STYLE LOADER ---
const AppleLoader = ({ status }: { status: string }) => (
    <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative w-10 h-10">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-[3px] h-[10px] bg-slate-400 dark:bg-white/40 left-[18.5px] top-0 rounded-full origin-[1.5px_20px]"
                    style={{
                        transform: `rotate(${i * 30}deg)`,
                        animation: `appleSpinner 1s linear infinite`,
                        animationDelay: `${i * 0.083}s`
                    }}
                />
            ))}
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-white/30 tracking-[0.2em] uppercase animate-pulse">{status}</span>
        <style jsx>{` @keyframes appleSpinner { 0% { opacity: 1; } 100% { opacity: 0.1; } } `}</style>
    </div>
);

// --- TYPES ---
interface UserRequest {
    id: string;
    name: string;
    email: string;
    phone?: string;
    idValue?: string;
    role: "Professor" | "Student" | "Entrepreneur";
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    documents: { name: string; url: string }[];
    institution?: string;
    source: "google_quick" | "manual_form";
}

interface NewsPost {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    imageUrl: string;
    publishDate: string; // YYYY-MM-DD
    status: "published" | "draft";
}

const STARTUP_DATE = new Date("2026-01-15T00:00:00");

export default function AdminControlRoom() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"monitor" | "credentials" | "agents" | "reports" | "payments">("reports"); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeBoard, setActiveBoard] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // --- STATES DO QUEUE ---
    const [requests, setRequests] = useState<UserRequest[]>([]);
    const [selectedReq, setSelectedReq] = useState<UserRequest | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isMockData, setIsMockData] = useState(false);

    // --- STATES DO REPORTS (NEWS) ---
    const [newsList, setNewsList] = useState<NewsPost[]>([]);
    const [currentPost, setCurrentPost] = useState<NewsPost>({
        id: '', // IMPORTANTE: Começa vazio para indicar "novo post" para a API
        title: '',
        subtitle: '',
        content: '',
        imageUrl: '',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'draft'
    });

    useEffect(() => { 
        setMounted(true);
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }
    };

    // --- FETCH DA QUEUE (USUÁRIOS) ---
    useEffect(() => {
        const fetchQueue = async () => {
            if (activeTab !== 'credentials') return;
            setIsLoadingData(true);
            try {
                const response = await fetch('/api/admin');
                if (response.ok) {
                    const data = await response.json();
                    setRequests(data.filter((r: any) => new Date(r.submittedAt) >= STARTUP_DATE));
                    setIsMockData(false);
                } else { throw new Error(); }
            } catch (error) {
                setIsMockData(true);
                setRequests([{ id: "mock_1", name: "Don Martinez", email: "donmartinez@zaeon.ai", role: "Entrepreneur", status: "pending", submittedAt: new Date().toISOString(), source: "google_quick", documents: [] }]);
            } finally { setIsLoadingData(false); }
        };
        fetchQueue();
    }, [activeTab]);

    // --- FETCH DAS NOTÍCIAS (REAL) ---
    const fetchNews = async () => {
        try {
            const res = await fetch('/api/news');
            if (res.ok) {
                const data = await res.json();
                // Formata a data ISO do banco para YYYY-MM-DD para o input funcionar
                const formattedList = data.map((post: any) => ({
                    ...post,
                    publishDate: post.publishDate ? post.publishDate.split('T')[0] : ''
                }));
                setNewsList(formattedList);
            }
        } catch (error) {
            console.error("Erro ao carregar notícias:", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchNews();
        }
    }, [activeTab]);

    // --- HANDLERS DO REPORTS ---
    const handleNewPost = () => {
        setCurrentPost({
            id: '', // Resetar ID para criar novo
            title: '',
            subtitle: '',
            content: '',
            imageUrl: '',
            publishDate: new Date().toISOString().split('T')[0],
            status: 'draft'
        });
    };

    const handleSavePost = async () => {
        if (!currentPost.title) return alert("Title is required");

        try {
            // Chamada REAL para a API
            const res = await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentPost)
            });

            if (res.ok) {
                const savedPost = await res.json();
                
                // Se foi salvo, atualiza a lista lateral
                fetchNews(); 
                
                // Se era novo, seta o ID retornado para modo de edição
                if (!currentPost.id) {
                    setCurrentPost(prev => ({ ...prev, id: savedPost.id }));
                }
                alert("Post synced with Zaeon Database.");
            } else {
                alert("Failed to save.");
            }
        } catch (error) {
            console.error(error);
            alert("Connection error.");
        }
    };

    const handleDeletePost = async () => {
        if (!currentPost.id) return; // Não dá pra deletar rascunho não salvo
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`/api/news?id=${currentPost.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchNews(); // Atualiza lista
                handleNewPost(); // Limpa editor
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!mounted) return <div className="w-full h-screen bg-white dark:bg-[#030014] flex items-center justify-center"><AppleLoader status="Initializing" /></div>;

    // --- ESTILOS PADRONIZADOS ---
    const cardStyleLight = "bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl";
    const cardStyleDark = "bg-[#082f49]/60 backdrop-blur-xl border border-white/5 shadow-2xl hover:bg-[#082f49]/80";

    return (
        <div className="fixed inset-0 z-[500] pt-0 bg-slate-50 dark:bg-[#030014] transition-colors duration-500 overflow-hidden flex font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 hidden dark:block"><MatrixRain /></div>

            {/* THEME TOGGLE */}
            <div className="fixed left-6 z-[600]" style={{ top: '24px' }}>
                <div onClick={toggleTheme} className={`w-12 h-12 rounded-2xl border cursor-pointer shadow-2xl flex items-center justify-center transition-all hover:scale-105 bg-white dark:bg-black/40 border-slate-200 dark:border-white/20 text-slate-400 dark:text-white hover:text-amber-500 dark:hover:text-yellow-300`}>
                    {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </div>
            </div>

            {/* SIDEBAR */}
            <motion.nav
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
                animate={{ width: isSidebarOpen ? 260 : 80, x: 0, opacity: 1 }}
                className="fixed left-6 z-[550] flex flex-col py-8 rounded-[35px] border shadow-2xl backdrop-blur-2xl bg-white/80 dark:bg-black/80 border-slate-200 dark:border-white/10 h-[calc(100vh-48px)] top-6"
            >
                <div className="h-16 w-full"></div>
                <div className="flex flex-col gap-3 px-3 mt-4">
                    <SidebarItem icon={ChartBarIcon} label="Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={IdentificationIcon} label="Queue" active={activeTab === 'credentials'} onClick={() => setActiveTab('credentials')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={SparklesIcon} label="Agents" active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={DocumentChartBarIcon} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} isOpen={isSidebarOpen} />
                    <SidebarItem icon={CurrencyDollarIcon} label="Finance" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} isOpen={isSidebarOpen} />
                </div>
                <div className="mt-auto px-3">
                    <button onClick={() => router.push('/')} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                        <ArrowLeftIcon className="w-6 h-6 shrink-0" />
                        {isSidebarOpen && <span className="text-[10px] font-black uppercase">Exit</span>}
                    </button>
                </div>
            </motion.nav>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 relative z-10 pl-28 pr-6 py-6 h-full flex flex-col">
                
                {/* ----------------- ABA: QUEUE (CREDENTIALS) ----------------- */}
                {activeTab === 'credentials' && (
                    <div className="flex-1 flex gap-6 overflow-hidden">
                        {/* LISTA DE USUÁRIOS */}
                        <div className="w-[400px] bg-slate-200/40 dark:bg-[#0a0a14]/60 backdrop-blur-md rounded-[45px] border border-slate-200 dark:border-white/10 flex flex-col shadow-inner overflow-hidden">
                            <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">Queue</h2>
                                <div className={`px-2 py-1 rounded-md text-[8px] font-black tracking-widest ${isMockData ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {isMockData ? 'MOCKUP' : 'API LIVE'}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {isLoadingData ? (
                                    <div className="pt-20"><AppleLoader status="Syncing" /></div>
                                ) : (
                                    requests.map((req) => (
                                        <div key={req.id} onClick={() => setSelectedReq(req)} className={`p-6 rounded-[28px] transition-all duration-300 cursor-pointer ${selectedReq?.id === req.id ? 'bg-white dark:bg-cyan-500/20 border-cyan-500 scale-[1.02] shadow-2xl ring-4 ring-cyan-500/5' : `border-transparent ${cardStyleLight} dark:${cardStyleDark}`}`}>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{req.name}</h3>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{req.email}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {/* DETALHES DO USUÁRIO */}
                        <div className="flex-1 bg-slate-200/40 dark:bg-[#0a0a14]/90 backdrop-blur-md rounded-[45px] border border-slate-200 dark:border-white/10 p-10 overflow-y-auto shadow-inner relative">
                            {selectedReq ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <div className="flex items-center gap-8 pb-10 border-b border-slate-300 dark:border-white/10">
                                        <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center text-2xl font-black text-slate-400 shadow-xl ${cardStyleLight} dark:${cardStyleDark}`}>{selectedReq.name.charAt(0)}</div>
                                        <div className="flex-1">
                                            <h1 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">{selectedReq.name}</h1>
                                            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{selectedReq.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <DetailBoard title="Institutional Data" value={selectedReq.source === 'google_quick' && !selectedReq.idValue ? "Not Submitted" : (selectedReq.institution || "Personal Account")} icon={ServerIcon} isActive={activeBoard === 'inst'} onClick={() => setActiveBoard(activeBoard === 'inst' ? null : 'inst')} baseStyle={`${cardStyleLight} dark:${cardStyleDark}`} statusColor={selectedReq.source === 'google_quick' && !selectedReq.idValue ? "text-red-500" : "text-emerald-500"} />
                                        <DetailBoard title="Origin" value={selectedReq.source === 'google_quick' ? 'Google Login' : 'Manual Entry'} icon={IdentificationIcon} isActive={activeBoard === 'origin'} onClick={() => setActiveBoard(activeBoard === 'origin' ? null : 'origin')} baseStyle={`${cardStyleLight} dark:${cardStyleDark}`} color="text-purple-500" />
                                        <DetailBoard title="Contact Phone" value={selectedReq.phone || "Not Provided"} icon={PhoneIcon} isActive={activeBoard === 'phone'} onClick={() => setActiveBoard(activeBoard === 'phone' ? null : 'phone')} baseStyle={`${cardStyleLight} dark:${cardStyleDark}`} />
                                        <DetailBoard title="Identification ID" value={selectedReq.idValue || "N/A"} icon={DocumentTextIcon} isActive={activeBoard === 'idv'} onClick={() => setActiveBoard(activeBoard === 'idv' ? null : 'idv')} baseStyle={`${cardStyleLight} dark:${cardStyleDark}`} color="text-amber-500" />
                                    </div>
                                    <div className="pt-10 space-y-4">
                                        <button className={`w-full font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 shadow-xl ${cardStyleLight} dark:${cardStyleDark} text-slate-800 dark:text-white`}><ChatBubbleLeftEllipsisIcon className="w-5 h-5" />Ask for Documents</button>
                                        <button className="w-full bg-slate-900 dark:bg-cyan-500 text-white dark:text-black font-black py-5 rounded-[28px] shadow-2xl transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-95"><ShieldCheckIcon className="w-5 h-5" />Authorize Soulbound Access</button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <Image src="/assets/zaeon-logo.png" alt="Logo" width={80} height={80} className="grayscale mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">System Idle</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ----------------- ABA: REPORTS (NEWS EDITOR) ----------------- */}
                {activeTab === 'reports' && (
                    <div className="flex-1 flex gap-6 overflow-hidden">
                        {/* LISTA DE NOTÍCIAS (ESQUERDA) */}
                        <div className="w-[320px] bg-slate-200/40 dark:bg-[#0a0a14]/60 backdrop-blur-md rounded-[45px] border border-slate-200 dark:border-white/10 flex flex-col shadow-inner overflow-hidden">
                            <div className="p-8 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/20">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">Posts</h2>
                                <button onClick={handleNewPost} className="p-2 bg-slate-800 dark:bg-white text-white dark:text-black rounded-full hover:scale-110 transition-transform">
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {newsList.length === 0 ? (
                                    <div className="text-center py-10 opacity-40 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-white">No posts yet</div>
                                ) : (
                                    newsList.map((post) => (
                                        <div key={post.id} onClick={() => setCurrentPost(post)} className={`p-4 rounded-3xl cursor-pointer transition-all border ${currentPost.id === post.id ? 'bg-white dark:bg-cyan-900/30 border-cyan-500' : 'bg-white/40 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10'}`}>
                                            <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{post.title || "Untitled"}</h4>
                                            <div className="flex justify-between mt-2 opacity-50 text-[10px]">
                                                <span>{post.publishDate}</span>
                                                <span className="uppercase">{post.status}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* EDITOR (DIREITA) */}
                        <div className="flex-1 bg-white dark:bg-[#0a0a14]/90 backdrop-blur-xl rounded-[45px] border border-slate-200 dark:border-white/10 flex flex-col shadow-2xl relative overflow-hidden">
                            
                            {/* Toolbar de Ação */}
                            <div className="absolute top-6 right-6 flex gap-2 z-20">
                                {/* Botão de Deletar com função real */}
                                <button onClick={handleDeletePost} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 hover:text-red-500 transition-colors">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                                {/* Botão de Publicar com função real */}
                                <button onClick={handleSavePost} className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-cyan-500 text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                                    <GlobeAmericasIcon className="w-4 h-4" /> Publish
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                                <div className="max-w-3xl mx-auto space-y-8">
                                    
                                    {/* Input de Imagem */}
                                    <div className="w-full h-48 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors cursor-pointer group relative overflow-hidden bg-slate-50 dark:bg-black/20">
                                        {currentPost.imageUrl ? (
                                            <img src={currentPost.imageUrl} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        ) : (
                                            <>
                                                <PhotoIcon className="w-8 h-8 mb-2" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Add Cover Image</span>
                                            </>
                                        )}
                                        {/* Input "Escondido" mas funcional para colar URL */}
                                        <input 
                                            type="text" 
                                            placeholder="Paste Image URL here"
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-black/50 text-white text-xs p-2 rounded-lg text-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            value={currentPost.imageUrl}
                                            onChange={(e) => setCurrentPost({...currentPost, imageUrl: e.target.value})}
                                        />
                                    </div>

                                    {/* Data */}
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-white/40">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <input 
                                            type="date" 
                                            value={currentPost.publishDate}
                                            onChange={(e) => setCurrentPost({...currentPost, publishDate: e.target.value})}
                                            className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest cursor-pointer"
                                        />
                                    </div>

                                    {/* Título e Subtítulo */}
                                    <div className="space-y-4">
                                        <input 
                                            type="text" 
                                            placeholder="Title" 
                                            className="w-full bg-transparent text-4xl font-black text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none border-none"
                                            value={currentPost.title}
                                            onChange={(e) => setCurrentPost({...currentPost, title: e.target.value})}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Subtitle..." 
                                            className="w-full bg-transparent text-xl font-medium text-slate-500 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-white/10 outline-none border-none"
                                            value={currentPost.subtitle}
                                            onChange={(e) => setCurrentPost({...currentPost, subtitle: e.target.value})}
                                        />
                                    </div>

                                    {/* Corpo do Texto */}
                                    <textarea 
                                        placeholder="Tell your story..." 
                                        className="w-full h-[500px] bg-transparent text-lg leading-relaxed text-slate-700 dark:text-slate-300 placeholder:text-slate-200 dark:placeholder:text-white/5 outline-none resize-none font-serif"
                                        value={currentPost.content}
                                        onChange={(e) => setCurrentPost({...currentPost, content: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
            </main>
        </div>
    );
}

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen }: any) => (
    <button onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
        <Icon className="w-6 h-6 shrink-0" />
        {isOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black uppercase tracking-widest">{label}</motion.span>}
    </button>
);

const DetailBoard = ({ title, value, icon: Icon, color = "text-cyan-500", statusColor, isActive, onClick, baseStyle }: any) => (
    <div onClick={onClick} className={`p-7 rounded-[28px] border transition-all duration-300 cursor-pointer relative overflow-hidden ${isActive ? 'bg-white dark:bg-cyan-900/40 border-cyan-400 ring-4 ring-cyan-500/10 shadow-2xl scale-[1.02]' : baseStyle}`}>
        <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-500' : color}`} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
        </div>
        <p className={`text-lg font-bold truncate ${isActive ? 'text-cyan-600 dark:text-cyan-400' : (statusColor || 'text-slate-800 dark:text-white')}`}>{value}</p>
    </div>
);