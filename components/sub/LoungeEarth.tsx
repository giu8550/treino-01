"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
    ExclamationTriangleIcon,
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
    HeartIcon,
    GlobeAltIcon,
    CpuChipIcon,
    PaperAirplaneIcon,
    ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

// --- TYPES ATUALIZADOS ---
interface Comment {
    id: string;
    user: string;
    content: string;
    time: string;
}

interface Post {
    id: string;
    user: string;
    content: string;
    time: string;
    likes: number;
    isLiked: boolean;
    commentsList: Comment[]; // Lista de comentários do post
}

// --- CONFIGURAÇÕES VISUAIS DO GLOBO (PRESERVADAS) ---
const COLOR_TECH_BLUE = new THREE.Color("#001a2c");
const COLOR_WIRE_BLUE = new THREE.Color("#00d2ff");
const COLOR_DOT       = new THREE.Color("#00f0ff");

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};

const LocationMarker = ({ lat, lon, code, onHover, onClick }: { lat: number, lon: number, code: string, onHover: (code: string | null) => void, onClick: (code: string) => void }) => {
    const ref = useRef<THREE.Mesh>(null);
    const position = latLonToVector3(lat, lon, 0.785);

    useFrame(({ clock }) => {
        if (ref.current) {
            const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
            ref.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <mesh
            ref={ref}
            position={position}
            onClick={(e) => { e.stopPropagation(); onClick(code); }}
            onPointerOver={(e) => { e.stopPropagation(); onHover(code); }}
            onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
        >
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshBasicMaterial color={COLOR_DOT} toneMapped={false} />
        </mesh>
    );
};

const CyberGlobe = ({ onSelectRegion, onHoverRegion }: { onSelectRegion: (region: string) => void, onHoverRegion: (region: string | null) => void }) => {
    const coreRef = useRef<THREE.Mesh>(null);
    const wireframeGroupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (coreRef.current) coreRef.current.rotation.y = t / 15;
        if (wireframeGroupRef.current) wireframeGroupRef.current.rotation.y = t / 15;
    });

    return (
        <group>
            <Sphere ref={coreRef} args={[0.75, 64, 64]}>
                <meshPhongMaterial color={COLOR_TECH_BLUE} transparent opacity={0.8} shininess={100} specular={new THREE.Color("#00d2ff")} />
            </Sphere>
            <group ref={wireframeGroupRef}>
                <Sphere args={[0.775, 32, 32]}>
                    <meshBasicMaterial color={COLOR_WIRE_BLUE} wireframe transparent opacity={0.2} toneMapped={false} />
                </Sphere>
                <LocationMarker lat={39.8} lon={-98.6} code="USA" onHover={onHoverRegion} onClick={onSelectRegion} />
                <LocationMarker lat={-14.2} lon={-51.9} code="BRA" onHover={onHoverRegion} onClick={onSelectRegion} />
                <LocationMarker lat={35.8} lon={104.1} code="CHN" onHover={onHoverRegion} onClick={onSelectRegion} />
            </group>
        </group>
    );
};

export default function ZaeonLobby() {
    const { data: session, status } = useSession();
    const [accessError, setAccessError] = useState<string | null>(null);
    const [showBrazilFeed, setShowBrazilFeed] = useState(false);
    const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
    const isConnected = status === "authenticated";

    // --- LOGICA DO FEED E COMENTÁRIOS ---
    const [newPost, setNewPost] = useState("");
    const [newComment, setNewComment] = useState("");
    const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Post aberto para leitura

    const [posts, setPosts] = useState<Post[]>([
        {
            id: "r1", user: "Zaeon Protocol", content: "⚠️ Regras: A Zaeon é um ambiente de colaboração acadêmica. Respeite os outros estudantes, pesquisadores, professores e agentes. Postagens desrespeitosas ou coisas fora de contexto podem resultar em banimento permanente do sistema.",
            time: "System", likes: 99, isLiked: false, commentsList: []
        },
        {
            id: "p1", user: "Agente Alpha", content: "Iniciando monitoramento do Cluster Brasil. Bem-vindos, exploradores e cientistas. ",
            time: "1h", likes: 12, isLiked: false,
            commentsList: [
                { id: "c1", user: "Dev Junior", content: "Pronto para deploy!", time: "50m" },
                { id: "c2", user: "Ana Pesquisadora", content: "Aguardando credenciais.", time: "30m" }
            ]
        }
    ]);

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        const post: Post = {
            id: Date.now().toString(),
            user: session?.user?.name || "Don Martinez",
            content: newPost,
            time: "Agora",
            likes: 0,
            isLiked: false,
            commentsList: []
        };
        setPosts([post, ...posts]);
        setNewPost("");
    };

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedPost) return;

        const comment: Comment = {
            id: Date.now().toString(),
            user: session?.user?.name || "Don Martinez",
            content: newComment,
            time: "Agora"
        };

        // Atualiza o post selecionado e a lista principal
        const updatedPost = { ...selectedPost, commentsList: [...selectedPost.commentsList, comment] };
        setSelectedPost(updatedPost);

        setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
        setNewComment("");
    };

    const toggleLike = (id: string) => {
        const updatedPosts = posts.map(p => {
            if (p.id === id) {
                return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
            }
            return p;
        });
        setPosts(updatedPosts);

        // Se o post curtido estiver aberto, atualiza ele também
        if (selectedPost && selectedPost.id === id) {
            const current = updatedPosts.find(p => p.id === id);
            if (current) setSelectedPost(current);
        }
    };

    const handleSelectRegion = (code: string) => {
        if (!isConnected) return;
        if (code === "USA" || code === "CHN") {
            setAccessError(`Acesso negado ao Cluster ${code}: Credenciais insuficientes.`);
            setShowBrazilFeed(false);
            setSelectedPost(null);
        } else {
            setAccessError(null);
            setShowBrazilFeed(true);
        }
    };

    // Fecha o feed e reseta a seleção
    const closeFeed = () => {
        setShowBrazilFeed(false);
        setSelectedPost(null);
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#010409] flex items-center justify-center p-6 lg:p-12 overflow-hidden">

            {/* SIDEBAR */}
            <div className="h-[80vh] w-16 border-l border-y border-white/10 bg-black/40 backdrop-blur-2xl rounded-l-[40px] flex flex-col items-center py-10 z-[100] shadow-2xl">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" : "bg-red-500 shadow-[0_0_15px_#ef4444]"}`} />
            </div>

            {/* STATION CARD */}
            <div className="h-[80vh] flex-1 max-w-5xl bg-white/5 backdrop-blur-md border border-white/10 rounded-r-[40px] flex flex-col relative overflow-hidden shadow-2xl">

                {/* HEADER FIXO */}
                <div className="w-full pt-10 pb-4 flex flex-col items-center z-[60] pointer-events-none">
                    <h1 className="text-[10px] font-black uppercase tracking-[1em] text-white/40 flex items-center gap-4">
                        <span className="w-8 h-[1px] bg-white/10" />
                        Zaeon Global Network
                        <span className="w-8 h-[1px] bg-white/10" />
                    </h1>
                </div>

                {/* CLUSTER STATUS CARD */}
                <AnimatePresence>
                    {(hoveredCluster || showBrazilFeed) && !selectedPost && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-10 right-10 z-[70] bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl w-48 shadow-2xl pointer-events-none"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <CpuChipIcon className="w-4 h-4 text-cyan-400" />
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                    {showBrazilFeed ? "BRAZIL" : hoveredCluster}
                                </span>
                            </div>
                            <p className="text-[8px] text-white/40 uppercase font-bold tracking-tighter">
                                {showBrazilFeed ? "Connection: Active" : "Status: Target Locked"}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* GLOBO AO FUNDO */}
                <div className="absolute inset-0 z-0 pt-10">
                    <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }} gl={{ antialias: true }}>
                        <ambientLight intensity={0.7} />
                        <pointLight position={[10, 10, 10]} intensity={2.5} />
                        <CyberGlobe onSelectRegion={handleSelectRegion} onHoverRegion={setHoveredCluster} />
                        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.4} />
                    </Canvas>
                </div>

                {/* FEED DRAWER */}
                <AnimatePresence>
                    {showBrazilFeed && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: "20%" }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 120 }}
                            className="absolute inset-x-0 bottom-0 z-50 h-[80%] bg-black/40 backdrop-blur-2xl border-t border-white/10 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col"
                        >
                            <div onClick={closeFeed} className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 cursor-pointer hover:bg-white/30 transition-all" />

                            {/* CONTAINER DE CONTEÚDO COM TRANSIÇÃO ENTRE LISTA E DETALHE */}
                            <div className="flex-1 overflow-hidden relative">
                                <AnimatePresence mode="wait">

                                    {/* MODO LISTA DE POSTS */}
                                    {!selectedPost ? (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="h-full flex flex-col"
                                        >
                                            <div className="px-10 mt-4 mb-6">
                                                <form onSubmit={handlePost} className="relative group">
                                                    <input
                                                        type="text"
                                                        value={newPost}
                                                        onChange={(e) => setNewPost(e.target.value)}
                                                        placeholder="Transmitir mensagem para o Cluster Brasil..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                                                    />
                                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-300 transition-colors">
                                                        <PaperAirplaneIcon className="w-5 h-5" />
                                                    </button>
                                                </form>
                                            </div>

                                            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 space-y-4">
                                                <div className="flex items-center gap-3 text-cyan-400 mb-6">
                                                    <GlobeAltIcon className="w-5 h-5 animate-spin-slow" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Feed: Cluster BRA</span>
                                                </div>

                                                {posts.map(post => (
                                                    <FeedPost
                                                        key={post.id}
                                                        post={post}
                                                        onLike={() => toggleLike(post.id)}
                                                        onClick={() => setSelectedPost(post)}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (

                                        /* MODO DETALHE (THREAD) */
                                        <motion.div
                                            key="detail"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="h-full flex flex-col"
                                        >
                                            {/* HEADER DO POST ABERTO */}
                                            <div className="px-10 pt-2 pb-4 border-b border-white/5 flex items-center gap-4">
                                                <button
                                                    onClick={() => setSelectedPost(null)}
                                                    className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                                >
                                                    <ArrowLeftIcon className="w-5 h-5" />
                                                </button>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Thread View</span>
                                            </div>

                                            <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20">
                                                {/* POST ORIGINAL (DESTACADO) */}
                                                <div className="py-6 border-b border-white/5">
                                                    <FeedPost
                                                        post={selectedPost}
                                                        onLike={() => toggleLike(selectedPost.id)}
                                                        isDetailView
                                                    />
                                                </div>

                                                {/* LISTA DE COMENTÁRIOS */}
                                                <div className="py-6 space-y-6">
                                                    <h3 className="text-[9px] font-black uppercase tracking-widest text-cyan-500/50 mb-4 pl-2">
                                                        Respostas ({selectedPost.commentsList.length})
                                                    </h3>
                                                    {selectedPost.commentsList.length === 0 ? (
                                                        <p className="text-xs text-white/20 italic pl-2">Nenhuma resposta ainda. Seja o primeiro.</p>
                                                    ) : (
                                                        selectedPost.commentsList.map((comment) => (
                                                            <div key={comment.id} className="flex gap-4 pl-4 border-l border-white/5">
                                                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                                                    <UserCircleIcon className="w-5 h-5 text-white/30" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[10px] font-bold text-white/80">{comment.user}</span>
                                                                        <span className="text-[8px] text-white/20 font-mono">• {comment.time}</span>
                                                                    </div>
                                                                    <p className="text-xs text-white/60 leading-relaxed">{comment.content}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* INPUT DE COMENTÁRIO */}
                                            <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-xl absolute bottom-0 w-full rounded-t-3xl">
                                                <form onSubmit={handleComment} className="relative">
                                                    <input
                                                        type="text"
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Adicionar resposta..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                                                    />
                                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cyan-500 hover:text-cyan-300 transition-colors">
                                                        <PaperAirplaneIcon className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MENSAGEM DE ERRO */}
                <AnimatePresence>
                    {accessError && !showBrazilFeed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[65] flex flex-col items-center gap-3 bg-red-500/10 border border-red-500/20 p-6 rounded-[30px] backdrop-blur-md"
                        >
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-500/40" />
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest text-center max-w-xs leading-relaxed">
                                {accessError}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="absolute inset-4 pointer-events-none border border-white/5 rounded-[50px] z-20" />
        </div>
    );
}

// --- SUBCOMPONENTE DE POST ---
function FeedPost({ post, onLike, onClick, isDetailView = false }: { post: Post, onLike: () => void, onClick?: () => void, isDetailView?: boolean }) {
    return (
        <div
            onClick={!isDetailView ? onClick : undefined}
            className={`
                bg-white/[0.03] border border-white/5 p-5 rounded-3xl transition-all group flex gap-5
                ${!isDetailView ? 'hover:bg-white/[0.06] cursor-pointer' : ''}
                ${isDetailView ? 'bg-white/[0.05] border-cyan-500/20' : ''}
            `}
        >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                <UserCircleIcon className="w-6 h-6 text-cyan-400/50" />
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-white/80 group-hover:text-cyan-300 transition-colors">{post.user}</span>
                        <span className="text-[9px] text-white/20 font-mono">• {post.time}</span>
                    </div>
                </div>
                <p className={`text-xs text-white/60 leading-relaxed font-medium ${!isDetailView ? 'group-hover:text-white/70' : 'text-white/90 text-sm'}`}>
                    {post.content}
                </p>
                <div className="flex gap-4 mt-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onLike(); }}
                        className="flex items-center gap-1.5 group/like"
                    >
                        {post.isLiked ? (
                            <HeartSolid className="w-4 h-4 text-red-500" />
                        ) : (
                            <HeartIcon className="w-4 h-4 text-white/20 group-hover/like:text-red-400 transition-colors" />
                        )}
                        <span className={`text-[10px] font-mono ${post.isLiked ? 'text-red-500' : 'text-white/20'}`}>{post.likes}</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-white/20 hover:text-cyan-400 transition-colors">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span className="text-[10px] font-mono">{post.commentsList.length}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}