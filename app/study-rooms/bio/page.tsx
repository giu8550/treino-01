'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Lock, XCircle, Activity, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
// Importação de imagem otimizada
import Image from 'next/image';

// Termos Biológicos
const BIO_TERMS = [
    "Mitochondria", "Ribosome", "Nucleus", "Cytoplasm", "Membrane",
    "Lysosome", "Golgi", "Endoplasmic", "Vacuole", "Chloroplast",
    "DNA", "RNA", "CRISPR", "Enzyme", "Protein",
    "Lipid", "Carbohydrate", "Glucose", "ATP", "ADP",
    "Neuron", "Axon", "Synapse", "Dendrite", "Myelin",
    "Hemoglobin", "Leukocyte", "Platelet", "Plasma", "Antibody",
    "Antigen", "Virus", "Bacteria", "Fungi", "Mitosis"
];

const ZaeonBiologyRoom = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [isLoaded, setIsLoaded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isError, setIsError] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true); // Estado para o tema

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // --- 1. DETECÇÃO DE TEMA (Igual à Cyber Page) ---
    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };
        checkTheme();

        // Observa mudanças na classe 'dark' do HTML
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
            // router.push('/dashboard-bio');
        } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 1000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAuth();
    };

    // --- 3. BIO-PHYSICS ENGINE (DNA 3D) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000, radius: 250 }; // Raio de repulsão

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

        class Molecule {
            text: string;
            y: number;
            strand: 1 | 2;
            x: number = 0;
            z: number = 0;
            scale: number = 1;
            opacity: number = 1;
            color: string;
            baseX: number = 0;

            constructor(text: string, startY: number, strand: 1 | 2) {
                this.text = text;
                this.y = startY;
                this.strand = strand;
                // Cores baseadas no tema serão definidas no draw, mas aqui definimos o tom base
                this.color = strand === 1 ? '#10B981' : '#06b6d4';
            }

            update(canvasW: number, canvasH: number, speed: number) {
                this.y -= speed;

                // Loop Infinito Vertical
                const totalHeight = BIO_TERMS.length * 45;
                if (this.y < -50) {
                    this.y += totalHeight;
                }

                // --- MATEMÁTICA DA DUPLA HÉLICE ---
                const helixRadius = 140; // Raio mais largo para ver melhor
                const helixCenter = canvasW * 0.18; // Posição fixa à esquerda (Coluna de DNA)
                const frequency = 0.006; // Frequência da onda

                // Calcula o ângulo baseado na altura (Y)
                const angle = (this.y * frequency) + (this.strand === 1 ? 0 : Math.PI);

                // Posição Base (Sem mouse)
                this.baseX = helixCenter + Math.cos(angle) * helixRadius;
                const baseZ = Math.sin(angle); // Profundidade (-1 a 1)

                // Define Escala e Opacidade baseadas na profundidade (Z)
                this.scale = 0.6 + (baseZ + 1) * 0.25;
                this.opacity = 0.4 + (baseZ + 1) * 0.4;

                // Inicializa X se for a primeira vez
                if (this.x === 0) this.x = this.baseX;

                // --- FÍSICA DE MOUSE ---
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                // Força de Retorno (Elasticidade para voltar ao DNA)
                this.x += (this.baseX - this.x) * 0.08;

                // Força de Repulsão (Mouse)
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const repulsionX = (dx / dist) * force * 40; // Empurrão forte
                    const repulsionY = (dy / dist) * force * 40;

                    this.x -= repulsionX;
                    this.y -= repulsionY;
                    this.scale = Math.min(this.scale * 1.3, 1.5); // Aumenta ao passar o mouse
                    this.opacity = 1;
                }
            }

            draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
                // Ajuste de cores para Claro/Escuro
                let displayColor = this.color;
                let textColor = isDark ? '#ffffff' : '#1f2937';

                if (!isDark) {
                    // No modo claro, escurecemos um pouco as cores do DNA para contraste
                    displayColor = this.strand === 1 ? '#059669' : '#0891b2';
                }

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(this.scale, this.scale);

                // Círculo da Molécula
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fillStyle = displayColor;
                ctx.globalAlpha = this.opacity;
                ctx.fill();

                // Brilho (apenas modo escuro)
                if (isDark) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = displayColor;
                }

                // Texto (Balão)
                ctx.fillStyle = textColor;
                ctx.globalAlpha = this.opacity;
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.text, 15, 0);

                ctx.restore();
            }
        }

        // Instanciação
        const molecules: Molecule[] = [];
        const spacing = 45;

        BIO_TERMS.forEach((term, i) => {
            const strand = i % 2 === 0 ? 1 : 2;
            const startY = canvas.height + (i * spacing);
            molecules.push(new Molecule(term, startY, strand));
        });

        // Loop de Renderização
        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Verifica tema atual no DOM
            const isDarkNow = document.documentElement.classList.contains('dark');

            // --- DESENHO DAS FITAS (STRANDS) ---
            // Desenhamos as linhas ANTES dos pontos para ficar "atrás"
            // Separamos por fita e ordenamos por Y
            const drawStrand = (strandNum: 1 | 2) => {
                const strandMols = molecules.filter(m => m.strand === strandNum).sort((a, b) => a.y - b.y);

                ctx.beginPath();
                // Cor da linha
                ctx.strokeStyle = isDarkNow
                    ? (strandNum === 1 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(6, 182, 212, 0.4)')
                    : (strandNum === 1 ? 'rgba(5, 150, 105, 0.3)' : 'rgba(8, 145, 178, 0.3)');

                ctx.lineWidth = 4; // Linha grossa para ser visível

                // Suavização da linha (Bézier curves se possível, ou lineTo simples)
                if (strandMols.length > 0) {
                    ctx.moveTo(strandMols[0].x, strandMols[0].y);
                    for (let i = 1; i < strandMols.length; i++) {
                        // Só conecta se a distância não for o "pulo" do loop infinito
                        if (Math.abs(strandMols[i].y - strandMols[i-1].y) < 100) {
                            ctx.lineTo(strandMols[i].x, strandMols[i].y);
                        } else {
                            ctx.moveTo(strandMols[i].x, strandMols[i].y);
                        }
                    }
                }
                ctx.stroke();
            };

            // Atualiza posições
            molecules.forEach(m => m.update(canvas.width, canvas.height, 0.6));

            // Desenha Fitas
            drawStrand(1);
            drawStrand(2);

            // Desenha Moléculas (Pontos e Texto) - Ordenado por Z (escala) para profundidade correta
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
    }, []); // Array vazio para rodar apenas no mount

    return (
        // Fundo: Verde Escuro (Dark) e Cinza Claro (Light)
        <div className="relative w-screen h-screen overflow-hidden bg-gray-100 dark:bg-[#021f15] font-mono transition-colors duration-500">

            {/* CAMADA 1: IMAGEM FIXA (Opcional, se tiver assets/dna.png) */}
            {/* Se não tiver imagem específica, removemos ou usamos um placeholder sutil */}

            {/* CAMADA 2: CANVAS (O DNA Interativo) */}
            <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

            {/* CAMADA 3: MODAL CENTRAL (Cópia exata da lógica Cyber) */}
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
                                : 'bg-gray-50 dark:bg-green-900/20 border-gray-100 dark:border-green-800/50'
                            }`}>
                                <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest ${isError ? 'text-red-500' : 'text-gray-500 dark:text-green-500'}`}>
                                    <Activity size={10} />
                                    <span>{isError ? t('tech_room.access_denied_code') : "BIO_GATEWAY_V1"}</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className={`w-1.5 h-1.5 border animate-pulse rounded-full ${isError ? 'bg-red-500 border-red-400' : 'bg-green-500 border-green-400'}`}></div>
                                </div>
                            </div>

                            {/* Corpo do Modal */}
                            <div className="p-5 relative overflow-hidden">
                                {/* Grid decorativo sutil */}
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

                                    {/* Input Field */}
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
                                                <span className={`pl-3 font-bold text-sm transition-colors ${isError ? 'text-red-500' : 'text-gray-400 dark:text-green-500'}`}>{'>'}</span>
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