'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Importação otimizada de Imagem
import Image from 'next/image';
// 1. Importação da Tradução
import { useTranslation } from 'react-i18next';

// Lista de chaves do i18n para os cursos
const COURSE_KEYS = [
    "tech_room.courses.cs", "tech_room.courses.se", "tech_room.courses.is", "tech_room.courses.ce",
    "tech_room.courses.ads", "tech_room.courses.net", "tech_room.courses.infosec", "tech_room.courses.db",
    "tech_room.courses.it_mgmt", "tech_room.courses.games", "tech_room.courses.ai", "tech_room.courses.ds",
    "tech_room.courses.cloud", "tech_room.courses.devops", "tech_room.courses.cyber", "tech_room.courses.block",
    "tech_room.courses.bigdata", "tech_room.courses.mba"
];

const ZaeonComputerScienceRoom = () => {
    // 2. Inicialização do Hook de Tradução
    const { t } = useTranslation();
    const router = useRouter();

    const [isLoaded, setIsLoaded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isError, setIsError] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Detectar mudança de tema para atualizar o canvas
    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const timer = setTimeout(() => setIsLoaded(true), 1000);
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    const handleAuth = () => {
        if (inputValue === "ZA-2026") {
            setIsError(false);
            console.log("Acesso Permitido");
            // router.push('/dashboard');
        } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 1000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAuth();
    };

    // --- PHYSICS ENGINE AVANÇADA ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Traduz os cursos dinamicamente
        const translatedCourses = COURSE_KEYS.map(key => t(key));

        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000, radius: 150 };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        const resize = () => {
            if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            x: number; y: number; vx: number; vy: number; text: string; width: number; height: number; color: string;

            constructor(text: string, canvasW: number, canvasH: number) {
                this.text = text;
                const minX = canvasW * 0.35; // Nasce apenas na área livre
                this.x = Math.random() * (canvasW - minX) + minX;
                this.y = Math.random() * canvasH;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.width = text.length * 7 + 20;
                this.height = 28;
                // Cores vibrantes para o destaque lateral
                const colors = ['#A855F7', '#10B981', '#3B82F6', '#06b6d4'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update(canvasW: number, canvasH: number, modalRect: DOMRect | null, particles: Particle[]) {
                // Movimento
                this.x += this.vx;
                this.y += this.vy;

                // 0. Mouse Repulsion
                const dxMouse = this.x - mouse.x;
                const dyMouse = this.y - mouse.y;
                const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distanceMouse < mouse.radius) {
                    const force = (mouse.radius - distanceMouse) / mouse.radius;
                    const forceX = (dxMouse / distanceMouse) * force * 3;
                    const forceY = (dyMouse / distanceMouse) * force * 3;
                    this.x += forceX;
                    this.y += forceY;
                }

                // 1. Paredes da Tela e Imagem
                const imageBarrier = canvasW * 0.34; // 34% da tela é a imagem
                if (this.x + this.width > canvasW) { this.x = canvasW - this.width; this.vx *= -1; }
                if (this.x < imageBarrier) { this.x = imageBarrier; this.vx *= -1; } // Colisão Sólida com Imagem
                if (this.y + this.height > canvasH) { this.y = canvasH - this.height; this.vy *= -1; }
                if (this.y < 0) { this.y = 0; this.vy *= -1; }

                // 2. COLISÃO COM O MODAL (IMPENETRÁVEL)
                if (modalRect) {
                    const pad = 15; // Margem de segurança
                    if (this.x < modalRect.right + pad &&
                        this.x + this.width > modalRect.left - pad &&
                        this.y < modalRect.bottom + pad &&
                        this.y + this.height > modalRect.top - pad) {

                        const overlapLeft = (this.x + this.width) - (modalRect.left - pad);
                        const overlapRight = (modalRect.right + pad) - this.x;
                        const overlapTop = (this.y + this.height) - (modalRect.top - pad);
                        const overlapBottom = (modalRect.bottom + pad) - this.y;

                        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                        if (minOverlap === overlapLeft) {
                            this.x = modalRect.left - pad - this.width;
                            this.vx = -Math.abs(this.vx);
                        } else if (minOverlap === overlapRight) {
                            this.x = modalRect.right + pad;
                            this.vx = Math.abs(this.vx);
                        } else if (minOverlap === overlapTop) {
                            this.y = modalRect.top - pad - this.height;
                            this.vy = -Math.abs(this.vy);
                        } else if (minOverlap === overlapBottom) {
                            this.y = modalRect.bottom + pad;
                            this.vy = Math.abs(this.vy);
                        }
                    }
                }

                // 3. Colisão entre Baloes
                for (let other of particles) {
                    if (other === this) continue;
                    if (this.x < other.x + other.width && this.x + this.width > other.x &&
                        this.y < other.y + other.height && this.y + this.height > other.y) {

                        const tempVx = this.vx; this.vx = other.vx; other.vx = tempVx;
                        const tempVy = this.vy; this.vy = other.vy; other.vy = tempVy;
                        this.x += this.vx; this.y += this.vy;
                    }
                }
            }

            draw(context: CanvasRenderingContext2D, isDark: boolean) {
                context.beginPath();
                context.roundRect(this.x, this.y, this.width, this.height, 6);
                context.strokeStyle = this.color;
                context.lineWidth = 1;
                context.stroke();

                // Fundo do balão se adapta ao tema
                context.fillStyle = isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
                context.fill();

                // Texto se adapta ao tema
                context.fillStyle = isDark ? "#eee" : "#1f2937";
                context.font = "bold 10px monospace";
                context.fillText(this.text, this.x + 10, this.y + 18);
            }
        }

        // Instancia usando os nomes traduzidos
        let particles: Particle[] = translatedCourses.map(course => new Particle(course, canvas.width, canvas.height));

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const modalRect = modalRef.current ? modalRef.current.getBoundingClientRect() : null;

            const isDarkNow = document.documentElement.classList.contains('dark');

            particles.forEach(p => {
                p.update(canvas.width, canvas.height, modalRect, particles);
                p.draw(ctx, isDarkNow);
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [t]); // Adicionada dependência [t] para atualizar o canvas ao mudar idioma

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-gray-100 dark:bg-black font-mono text-gray-900 dark:text-white selection:bg-green-500/30 transition-colors duration-500">

            {/* CAMADA 1: IMAGEM (Única e Estática) */}
            <motion.div
                className="absolute inset-0 z-10 pointer-events-none"
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 1 }}
            >
                <div className="absolute top-16 bottom-0 left-0 w-1/3 border-r border-gray-300 dark:border-white/5 bg-transparent">
                    {/* ALTERAÇÃO AQUI: Substituído img por Image com fill */}
                    <Image
                        src="/assets/computer.png"
                        alt="Zaeon Tech Room"
                        fill
                        className="object-cover object-center opacity-100"
                        priority
                    />
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-100 dark:from-black via-gray-100/50 dark:via-black/50 to-transparent"></div>
                </div>
            </motion.div>

            {/* CAMADA 2: CANVAS (Z-20) */}
            <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

            {/* CAMADA 3: MODAL (Z-50) */}
            <AnimatePresence>
                {isLoaded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: isError ? [0, -10, 10, -10, 10, 0] : 0
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div
                            ref={modalRef}
                            className={`pointer-events-auto w-full max-w-[440px] transition-all duration-300 relative
                bg-white dark:bg-black 
                border-2
                ${isError
                                ? 'border-red-500 dark:border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] dark:shadow-red-900/50'
                                : 'border-gray-200 dark:border-green-800 shadow-xl dark:shadow-green-900/30'
                            }
              `}
                        >
                            {/* Top Bar */}
                            <div className={`border-b p-2 py-1.5 flex items-center justify-between select-none transition-colors duration-300
                ${isError
                                ? 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800/50'
                                : 'bg-gray-50 dark:bg-green-900/20 border-gray-100 dark:border-green-800/50'
                            }`}>
                                <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest ${isError ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-green-500'}`}>
                                    <Terminal size={10} />
                                    {/* TRADUÇÃO APLICADA */}
                                    <span>
                    {isError ? t('tech_room.access_denied_code') : t('tech_room.gateway_title')}
                  </span>
                                </div>
                                <div className="flex gap-1">
                                    <div className={`w-1.5 h-1.5 border animate-pulse rounded-full ${isError ? 'bg-red-500 border-red-400' : 'bg-green-500 border-green-400'}`}></div>
                                </div>
                            </div>

                            {/* Corpo */}
                            <div className="p-5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[length:100%_3px] pointer-events-none z-0 opacity-0 dark:opacity-100 bg-[linear-gradient(rgba(0,20,0,0)_50%,rgba(0,100,0,0.02)_50%)]"></div>

                                <div className="relative z-10 flex flex-col gap-4">

                                    {/* Header */}
                                    <div className={`border-l-2 pl-3 py-0.5 transition-colors duration-300 ${isError ? 'border-red-500' : 'border-gray-400 dark:border-green-600'}`}>
                                        <h2 className={`text-base font-bold tracking-wider flex items-center gap-2 ${isError ? 'text-red-600 dark:text-red-500' : 'text-gray-800 dark:text-white'}`}>
                                            {isError ? <XCircle className="w-4 h-4" /> : <Lock className={`w-4 h-4 ${isError ? '' : 'text-gray-400 dark:text-green-500'}`} />}
                                            {/* TRADUÇÃO APLICADA */}
                                            {t('tech_room.restricted_title')}
                                        </h2>
                                        <p className={`text-[10px] mt-0.5 uppercase tracking-widest transition-colors ${isError ? 'text-red-500' : 'text-gray-500 dark:text-green-500/70'}`}>
                                            {/* TRADUÇÃO APLICADA */}
                                            {isError ? t('tech_room.msg_denied') : t('tech_room.student_area')}
                                        </p>
                                    </div>

                                    {/* Input */}
                                    <div className="space-y-3 pt-1">
                                        <div className="relative group">
                                            {/* TRADUÇÃO APLICADA */}
                                            <label className={`text-[9px] uppercase font-bold mb-1 block transition-colors ${isError ? 'text-red-500' : 'text-gray-400 dark:text-green-500/50'}`}>
                                                {t('tech_room.key_label')}
                                            </label>
                                            <div className={`flex items-center border transition-colors duration-300 
                        ${isError
                                                ? 'border-red-300 bg-red-50 dark:border-red-500/60 dark:bg-red-900/10'
                                                : 'border-gray-200 bg-gray-50 dark:border-green-500/60 dark:bg-green-900/10'
                                            }`}>
                                                <span className={`pl-3 font-bold text-sm transition-colors ${isError ? 'text-red-500' : 'text-gray-400 dark:text-green-500'}`}>{'>'}</span>
                                                <input
                                                    type="password"
                                                    value={inputValue}
                                                    onChange={(e) => { setInputValue(e.target.value); setIsError(false); }}
                                                    onKeyDown={handleKeyDown}
                                                    className={`w-full bg-transparent border-none px-3 py-2 text-sm focus:ring-0 font-mono tracking-widest 
                            ${isError ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-700/50'}`}
                                                    placeholder="••••••••"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAuth}
                                            className={`w-full border font-bold py-2 text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 group duration-300 hover:brightness-105
                      ${isError
                                                ? 'bg-red-100 border-red-200 text-red-600 dark:bg-red-800/40 dark:border-red-600 dark:text-red-300'
                                                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 dark:bg-green-800/40 dark:border-green-600 dark:text-green-300'
                                            }`}
                                        >
                                            {/* TRADUÇÃO APLICADA */}
                                            {isError ? t('tech_room.btn_wrong') : t('tech_room.btn_auth')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Rodapé */}
                            <div className={`border-t p-1.5 flex justify-between text-[7px] uppercase tracking-wider transition-colors duration-300
                ${isError
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40 text-red-500'
                                : 'bg-gray-50 dark:bg-black/90 border-gray-100 dark:border-green-900/40 text-gray-400 dark:text-green-800/70'
                            }`}>
                                {/* TRADUÇÃO APLICADA */}
                                <span>{t('tech_room.tunnel')}</span>
                                <span>{isError ? t('tech_room.status_fail') : t('tech_room.status_wait')}</span>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ZaeonComputerScienceRoom;