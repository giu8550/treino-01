'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Lock, XCircle, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

// Lista Duplicada para garantir fluxo contínuo sem buracos
const BASE_TERMS = [
    "Mitochondria", "Ribosome", "Nucleus", "Cytoplasm", "Membrane",
    "Lysosome", "Golgi", "Endoplasmic", "Vacuole", "Chloroplast",
    "DNA", "RNA", "CRISPR", "Enzyme", "Protein",
    "Lipid", "Carbohydrate", "Glucose", "ATP", "ADP",
    "Neuron", "Axon", "Synapse", "Dendrite", "Myelin",
    "Hemoglobin", "Leukocyte", "Platelet", "Plasma", "Antibody",
    "Antigen", "Virus", "Bacteria", "Fungi", "Mitosis"
];
// Concatenamos 2x para ter moléculas suficientes preenchendo qualquer altura de tela
const BIO_TERMS = [...BASE_TERMS, ...BASE_TERMS];

const ZaeonBiologyRoom = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [isLoaded, setIsLoaded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isError, setIsError] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // --- 1. DETECÇÃO DE TEMA ---
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

    // --- 2. LÓGICA DE LOGIN ---
    const handleAuth = () => {
        if (inputValue === "ZA-2026") {
            setIsError(false);
            console.log("Acesso Biológico Permitido");
        } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 1000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAuth();
    };

    // --- 3. BIO-PHYSICS ENGINE (DNA 3D Fluido) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000 };
        const interactionRadius = 300;

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };
        const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Configuração Geométrica do DNA
        const SPACING = 50; // Espaço fixo entre moléculas
        const TOTAL_HEIGHT = BIO_TERMS.length * SPACING; // Altura total do loop

        class Molecule {
            text: string;
            y: number;
            strand: 1 | 2;
            x: number = 0;
            scale: number = 1;
            opacity: number = 1;
            color: string;
            baseX: number = 0;

            constructor(text: string, startY: number, strand: 1 | 2) {
                this.text = text;
                this.y = startY;
                this.strand = strand;
                this.color = strand === 1 ? '#10B981' : '#06b6d4';
            }

            update(canvasW: number, speed: number) {
                // 1. Movimento Vertical
                this.y -= speed;

                // Lógica de Loop Perfeito (Sem quebra)
                // Se sair muito pra cima (-100), vai para o final exato da fila
                if (this.y < -100) {
                    this.y += TOTAL_HEIGHT;
                }

                // 2. Matemática da Hélice
                const helixRadius = 140;
                const helixCenter = canvasW * 0.18;
                const frequency = 0.005; // Frequência um pouco mais suave

                const angle = (this.y * frequency) + (this.strand === 1 ? 0 : Math.PI);
                this.baseX = helixCenter + Math.cos(angle) * helixRadius;
                const baseZ = Math.sin(angle);

                let targetScale = 0.6 + (baseZ + 1) * 0.25;
                let targetOpacity = 0.4 + (baseZ + 1) * 0.4;

                // 3. Física de Mola Sutil
                const dx = mouse.x - this.baseX;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let targetX = this.baseX;

                if (dist < interactionRadius && dist > 0) {
                    const pullStrength = Math.pow(1 - dist / interactionRadius, 2);
                    const maxPullDistance = 60;
                    const offsetX = (dx / dist) * pullStrength * maxPullDistance;
                    targetX = this.baseX + offsetX;
                    targetScale = Math.min(targetScale * 1.2, 1.5);
                    targetOpacity = 1;
                }

                if (this.x === 0) this.x = this.baseX;

                // Suavização do movimento (Lerp)
                this.x += (targetX - this.x) * 0.1;
                this.scale += (targetScale - this.scale) * 0.1;
                this.opacity += (targetOpacity - this.opacity) * 0.1;
            }

            draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
                let displayColor = this.color;
                let textColor = isDark ? '#ffffff' : '#1f2937';

                if (!isDark) {
                    displayColor = this.strand === 1 ? '#059669' : '#0891b2';
                }

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(this.scale, this.scale);

                // Círculo
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fillStyle = displayColor;
                ctx.globalAlpha = this.opacity;
                ctx.fill();

                // Sombra suave (Glow)
                if (isDark) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = displayColor;
                }

                // Texto
                ctx.fillStyle = textColor;
                ctx.globalAlpha = this.opacity;
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.text, 15, 0);

                ctx.restore();
            }
        }

        const molecules: Molecule[] = [];

        // Inicialização precisa para evitar buracos no start
        BIO_TERMS.forEach((term, i) => {
            const strand = i % 2 === 0 ? 1 : 2;
            // Começamos desenhando um pouco abaixo da tela para já ter continuidade ao subir
            const startY = canvas.height + (i * SPACING);
            molecules.push(new Molecule(term, startY, strand));
        });

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDarkNow = document.documentElement.classList.contains('dark');

            // Função para desenhar as linhas conectando as moléculas
            const drawStrand = (strandNum: 1 | 2) => {
                const strandMols = molecules.filter(m => m.strand === strandNum).sort((a, b) => a.y - b.y);

                ctx.beginPath();
                ctx.strokeStyle = isDarkNow
                    ? (strandNum === 1 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.4)')
                    : (strandNum === 1 ? 'rgba(5, 150, 105, 0.3)' : 'rgba(8, 145, 178, 0.3)');

                ctx.lineWidth = isDarkNow ? 5 : 4;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (strandMols.length > 0) {
                    // Começa do primeiro visível
                    let started = false;

                    for (let i = 0; i < strandMols.length - 1; i++) {
                        const curr = strandMols[i];
                        const next = strandMols[i+1];

                        // Apenas desenha se a distância for razoável (evita linha cruzando a tela no loop)
                        if (Math.abs(curr.y - next.y) < SPACING * 2.5) {
                            if (!started) {
                                ctx.moveTo(curr.x, curr.y);
                                started = true;
                            }
                            // Curva quadrática para suavidade extra na mola
                            const midX = (curr.x + next.x) / 2;
                            const midY = (curr.y + next.y) / 2;
                            ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
                            ctx.quadraticCurveTo(midX, midY, next.x, next.y);
                        } else {
                            started = false; // Quebra a linha se for o ponto de loop
                        }
                    }
                }
                ctx.stroke();
            };

            // Velocidade 1.2 (Um pouco mais rápido)
            molecules.forEach(m => m.update(canvas.width, 1.2));

            // Desenha as fitas primeiro (fundo)
            drawStrand(1);
            drawStrand(2);

            // Desenha as moléculas (frente)
            molecules.sort((a, b) => a.scale - b.scale);
            molecules.forEach(m => m.draw(ctx, isDarkNow));

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        // FUNDO ATUALIZADO: Degradê Verde Confortável e Bonito
        // from-emerald-800: Verde vivo no topo esquerdo
        // via-teal-900: Verde azulado no meio
        // to-black: Preto apenas no canto inferior direito para profundidade
        <div className={`relative w-screen h-screen overflow-hidden font-mono transition-colors duration-500
            bg-gray-100 
            dark:bg-[linear-gradient(to_bottom_right,_#065f46_0%,_#022c22_60%,_#000000_100%)]
        `}>

            {/* CAMADA 2: CANVAS (O DNA) */}
            <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

            {/* CAMADA 3: MODAL CENTRAL (Mantido idêntico) */}
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
                            bg-white dark:bg-black border-2
                            ${isError
                                ? 'border-red-500 dark:border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                                : 'border-gray-200 dark:border-green-900 shadow-xl dark:shadow-[0_0_40px_rgba(16,185,129,0.15)]'
                            }
                            `}
                        >
                            {/* Top Bar */}
                            <div className={`border-b p-2 py-1.5 flex items-center justify-between select-none transition-colors duration-300
                                ${isError
                                ? 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800/50'
                                : 'bg-green-900/20 border-green-800/50'
                            }`}>
                                <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest ${isError ? 'text-red-500' : 'text-gray-500 dark:text-green-500'}`}>
                                    <Activity size={10} />
                                    <span>{isError ? t('tech_room.access_denied_code') : "BIO_GATEWAY_V1"}</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className={`w-1.5 h-1.5 border animate-pulse rounded-full ${isError ? 'bg-red-500 border-red-400' : 'bg-green-500 border-green-400'}`}></div>
                                </div>
                            </div>

                            {/* Corpo */}
                            <div className="p-5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[length:100%_3px] pointer-events-none z-0 opacity-0 dark:opacity-50
                                     bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.05)_50%)]"></div>

                                <div className="relative z-10 flex flex-col gap-4">
                                    {/* Header */}
                                    <div className={`border-l-2 pl-3 py-0.5 transition-colors duration-300 ${isError ? 'border-red-500' : 'border-gray-400 dark:border-green-600'}`}>
                                        <h2 className={`text-base font-bold tracking-wider flex items-center gap-2 ${isError ? 'text-red-600 dark:text-red-500' : 'text-gray-800 dark:text-white'}`}>
                                            {isError ? <XCircle className="w-4 h-4" /> : <Lock className={`w-4 h-4 ${isError ? '' : 'text-gray-400 dark:text-green-500'}`} />}
                                            {t('tech_room.restricted_title')}
                                        </h2>
                                        <p className={`text-[10px] mt-0.5 uppercase tracking-widest transition-colors ${isError ? 'text-red-500' : 'text-gray-500 dark:text-green-500/70'}`}>
                                            {t('tech_room.student_area')}
                                        </p>
                                    </div>

                                    {/* Input */}
                                    <div className="space-y-3 pt-1">
                                        <div className="relative group">
                                            <label className={`text-[9px] uppercase font-bold mb-1 block transition-colors ${isError ? 'text-red-500' : 'text-gray-400 dark:text-green-500/50'}`}>
                                                {t('tech_room.key_label')}
                                            </label>
                                            <div className={`flex items-center border transition-colors duration-300 
                                                ${isError
                                                ? 'border-red-300 bg-red-50 dark:border-red-500/60 dark:bg-red-900/10'
                                                : 'border-gray-200 bg-gray-50 dark:border-green-500/60 dark:bg-green-900/10'
                                            }`}>
                                                <span className={`pl-3 font-bold text-sm transition-colors ${isError ? 'text-red-500' : 'text-green-500'}`}>{'>'}</span>
                                                <input
                                                    type="password"
                                                    value={inputValue}
                                                    onChange={(e) => { setInputValue(e.target.value); setIsError(false); }}
                                                    onKeyDown={handleKeyDown}
                                                    className={`w-full bg-transparent border-none px-3 py-2 text-sm focus:ring-0 font-mono tracking-widest 
                                                    ${isError ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-green-900/50'}`}
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

export default ZaeonBiologyRoom;