'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, BookOpen, Fingerprint, 
  ChevronUp, ChevronDown, Mars, Venus, Lock,
  Upload, Copy, Move 
} from 'lucide-react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';

interface ZaeonAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
}

const ZaeonAuthModal = ({ isOpen, onClose, role }: ZaeonAuthModalProps) => {
    const [mounted, setMounted] = useState(false);
    
    // --- ESTADOS DO FORMULÁRIO ---
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | string>(27);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [studyArea, setStudyArea] = useState('');
    const [studentId, setStudentId] = useState('');
    // Estado para a imagem de perfil enviada
    const [profilezaeonImage, setProfileZaeonImage] = useState<string | null>(null);

    const isReadyToSign = name.length > 2 && studyArea.length > 2;

    // --- CONFIGURAÇÃO DO DROPZONE (Upload de Imagem) ---
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileZaeonImage(imageUrl);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        noClick: !!profilezaeonImage, // Desativa clique se já tiver imagem (para usar os botões)
    });

    // Função para lidar com Paste (Ctrl+V)
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!isOpen) return;
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const imageUrl = URL.createObjectURL(blob);
                        setProfileZaeonImage(imageUrl);
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen]);


    // --- LÓGICA DE ESCAPE E BLOQUEIO DE SCROLL ---
    useEffect(() => {
        setMounted(true);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => { 
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // --- PHYSICS ENGINE (Fundo de Partículas) ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!isOpen || !mounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const baseWords = ["TECH", "AI", "DATA", "ZAEON", role.toUpperCase()];
        class Particle {
            x: number; y: number; vx: number; vy: number; text: string; size: number;
            constructor(text: string, w: number, h: number) {
                this.text = text;
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 10 + 10;
            }
            update(w: number, h: number) {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
            draw(ctx: CanvasRenderingContext2D) {
                ctx.font = `${this.size}px monospace`;
                ctx.fillStyle = "rgba(16, 185, 129, 0.10)";
                ctx.fillText(this.text, this.x, this.y);
            }
        }
        const particles = Array.from({ length: 20 }).map(() => 
            new Particle(baseWords[Math.floor(Math.random() * baseWords.length)], canvas.width, canvas.height)
        );
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(canvas.width, canvas.height); p.draw(ctx); });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isOpen, mounted, role]);

    const StringLine = ({ height }: { height: number }) => (
        <div 
            className="absolute left-1/2 -translate-x-1/2 w-[1px] bg-gray-400/60 dark:bg-white/20 z-0 pointer-events-none"
            style={{ height: `${height}px`, top: `-${height}px` }}
        />
    );

    if (!mounted || !isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-0">
            
            {/* BACKDROP */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
            </motion.div>

            {/* JANELA DO MODAL PRINCIPAL */}
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-[950px] h-[720px] bg-gray-200/90 dark:bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden border border-white/50 dark:border-white/10 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr]"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 text-gray-600 hover:text-red-500 transition-colors bg-white/80 dark:bg-black/20 rounded-full backdrop-blur-md shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* --- LADO ESQUERDO: CARTAS --- */}
                <div className="relative h-full p-8 flex flex-col items-center pt-14 overflow-y-auto no-scrollbar scroll-smooth">
                    
                    <div className="absolute top-6 left-6 opacity-5 dark:opacity-10 text-5xl font-black uppercase tracking-tighter -rotate-12 pointer-events-none select-none text-black dark:text-white">
                        {role}
                    </div>

                    <div className="w-full flex flex-col gap-6 pb-24 mt-2">

                        {/* CARTA 1: DADOS PESSOAIS */}
                        <motion.div
                            drag
                            dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
                            dragElastic={0.1}
                            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                            animate={{ y: [0, 2, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-30 w-full cursor-grab active:cursor-grabbing
                                       bg-white dark:bg-[#1e293b] 
                                       rounded-xl p-5
                                       border border-gray-100 dark:border-white/10
                                       shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-xl"
                        >
                            <StringLine height={70} />
                            
                            <div className="flex items-center gap-2 mb-4 border-b border-dashed border-gray-200 dark:border-white/10 pb-2 select-none">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">Identity Protocol</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider ml-1">Full Name</label>
                                    <div className="flex items-center bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-200 dark:border-white/5 px-3 py-1 focus-within:border-green-500/50 transition-colors">
                                        <User size={14} className="text-gray-400" />
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Subject Name"
                                            className="w-full bg-transparent border-none text-sm p-2 focus:ring-0 text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {/* INPUT DE IDADE */}
                                    <div className="flex-1">
                                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider ml-1">Age Cycle</label>
                                        <div className="flex items-center justify-between bg-gray-100 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-white/5 p-1 h-11 shadow-inner">
                                            <button 
                                                onClick={() => setAge(prev => Number(prev) > 1 ? Number(prev) - 1 : 1)} 
                                                className="h-full px-2 hover:bg-gray-200 dark:hover:bg-white/5 rounded text-gray-500 transition"
                                                tabIndex={-1}
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                            
                                            <input 
                                                type="number"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                                className="w-full bg-transparent border-none text-center font-mono text-lg font-bold text-blue-600 dark:text-blue-400 p-0 focus:ring-0 appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900"
                                            />

                                            <button 
                                                onClick={() => setAge(prev => Number(prev) + 1)} 
                                                className="h-full px-2 hover:bg-gray-200 dark:hover:bg-white/5 rounded text-gray-500 transition"
                                                tabIndex={-1}
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* SWITCH DE GÊNERO */}
                                    <div className="flex-1">
                                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-wider ml-1">Biometrics</label>
                                        <div className="relative flex h-11 bg-gray-100 dark:bg-[#0f172a] rounded-lg p-1 border border-gray-200 dark:border-white/5 shadow-inner cursor-pointer">
                                            <motion.div 
                                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md shadow-sm transition-all duration-300 z-0
                                                    ${gender === 'male' ? 'bg-blue-500' : 'bg-pink-500 left-[50%]'}`}
                                                layoutId="genderHighlight"
                                            />
                                            <button onClick={() => setGender('male')} className="flex-1 flex items-center justify-center relative z-10">
                                                <Mars size={16} className={`transition-colors duration-200 ${gender === 'male' ? 'text-white' : 'text-gray-500'}`} />
                                            </button>
                                            <button onClick={() => setGender('female')} className="flex-1 flex items-center justify-center relative z-10">
                                                <Venus size={16} className={`transition-colors duration-200 ${gender === 'female' ? 'text-white' : 'text-gray-500'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* CARTA 2: ÁREA */}
                        <motion.div
                            drag
                            dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
                            dragElastic={0.1}
                            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="relative z-20 w-full cursor-grab active:cursor-grabbing
                                       bg-white dark:bg-[#1e293b] 
                                       rounded-xl p-5
                                       border border-gray-100 dark:border-white/10
                                       shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-xl"
                        >
                            <StringLine height={40} />
                            <div className="flex items-center gap-2 mb-2 select-none">
                                <BookOpen size={14} className="text-purple-500" />
                                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Knowledge Base</span>
                            </div>
                            <input 
                                type="text" 
                                value={studyArea}
                                onChange={(e) => setStudyArea(e.target.value)}
                                placeholder="Ex: Software Engineering"
                                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-xs focus:ring-0 focus:border-purple-500 transition-colors text-gray-900 dark:text-gray-200 placeholder:text-gray-400"
                            />
                        </motion.div>

                        {/* CARTA 3: ID */}
                        <motion.div
                            drag
                            dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
                            dragElastic={0.1}
                            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                            animate={{ y: [0, 3, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="relative z-10 w-full cursor-grab active:cursor-grabbing
                                       bg-white dark:bg-[#1e293b] 
                                       rounded-xl p-4
                                       border border-gray-100 dark:border-white/10
                                       shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-xl"
                        >
                            <StringLine height={40} />
                            <div className="flex items-center gap-2 mb-2 justify-center opacity-70 select-none">
                                <Fingerprint size={12} className="text-gray-500" />
                                <span className="text-[8px] uppercase tracking-widest text-gray-500">Access Key (Optional)</span>
                            </div>
                            <input 
                                type="text" 
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="ZA-0000"
                                className="w-full bg-transparent border-b border-gray-300 dark:border-white/10 py-1 text-xs focus:outline-none focus:border-blue-500 text-center font-mono tracking-widest text-gray-600 dark:text-gray-300 placeholder:text-gray-400"
                            />
                        </motion.div>

                    </div>

                    {/* RODAPÉ FIXO (BOTÃO GOOGLE) */}
                    <div className="absolute bottom-6 w-full px-12 z-50 pointer-events-none">
                        <motion.div
                            animate={{ 
                                opacity: isReadyToSign ? 1 : 0.5, 
                                y: isReadyToSign ? 0 : 10,
                                filter: isReadyToSign ? 'grayscale(0%)' : 'grayscale(100%)'
                            }}
                            className="pointer-events-auto"
                        >
                            <button 
                                onClick={() => isReadyToSign && signIn('google')}
                                disabled={!isReadyToSign}
                                className={`w-full relative overflow-hidden group font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 border
                                    ${isReadyToSign 
                                        ? 'bg-white text-black hover:scale-[1.02] cursor-pointer border-gray-300 shadow-md' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-700'}`
                                }
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    {isReadyToSign ? (
                                        <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={20} height={20} />
                                    ) : (
                                        <Lock size={16} />
                                    )}
                                    <span className="text-sm">Sign in with Google</span>
                                </div>
                                {isReadyToSign && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                )}
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* --- LADO DIREITO: IMAGEM E UPLOAD --- */}
                {/* Adicionado 'group' aqui para permitir hover effects nos filhos */}
                <div className="relative hidden md:block border-l border-white/50 dark:border-white/10 h-full overflow-hidden bg-gray-100 dark:bg-[#0b121f] group">
                    <Image
                        src="/assets/computer.png"
                        alt="Zaeon Tech Room"
                        fill
                        // ADICIONADO EFEITO AQUI: group-hover:scale-105 e brightness-110
                        className="object-cover object-center transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:brightness-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    
                    <div 
                        {...getRootProps()}
                        className="absolute top-[15%] right-[28%] z-30 w-32 h-32 rounded-full border-2 border-blue-400 bg-blue-50/80 dark:bg-blue-900/50 backdrop-blur-md flex flex-col items-center justify-center text-center p-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] group/circle cursor-pointer overflow-visible"
                    >
                        <input {...getInputProps()} />
                        
                        {profilezaeonImage ? (
                            <Image src={profilezaeonImage} alt="Profile" fill className="object-cover rounded-full" />
                        ) : (
                            <>
                                <Upload size={20} className="text-blue-500 mb-1 group-hover/circle:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-300 leading-tight uppercase">
                                    Put your photo here
                                </span>
                                <div className="flex gap-2 mt-1 opacity-60">
                                    <Move size={10} className="text-blue-500" />
                                    <Copy size={10} className="text-blue-500" />
                                </div>
                            </>
                        )}
                        
                        {/* NOVO BOTÃO DE UPLOAD (BEM NO MEIO DA PARTE DE BAIXO) */}
                        <div className="absolute -bottom-3 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 z-40 border-2 border-white/20">
                            <Upload size={14} />
                        </div>

                        {isDragActive && (
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <Upload className="text-white animate-bounce" size={24} />
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-10 left-8 right-8 text-white z-10">
                        <div className="inline-block px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-400 font-mono mb-2 backdrop-blur-md">
                            SYSTEM: {role.toUpperCase()}_MODE
                        </div>
                        <h2 className="text-2xl font-bold leading-tight mb-2">Welcome to Zaeon</h2>
                        <p className="text-xs text-gray-300 leading-relaxed max-w-[80%]">
                            Fill your biometrics data to initialize your neural workspace environment.
                        </p>
                    </div>
                </div>

            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ZaeonAuthModal;