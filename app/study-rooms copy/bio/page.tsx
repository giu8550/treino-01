'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Lock, Activity, CheckCircle, AlertTriangle } from 'lucide-react'; // Ícones atualizados
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
    const [isModalOpen, setIsModalOpen] = useState(true); // Controla a visibilidade do modal

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // --- 1. CONFIGURAÇÃO INICIAL ---
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // --- 2. AÇÃO DO BOTÃO "UNDERSTOOD" ---
    const handleUnderstood = () => {
        setIsModalOpen(false);
        // Aqui você pode adicionar o redirecionamento ou a lógica para mostrar o conteúdo principal
        console.log("Usuário aceitou os termos da sala de Biologia.");
        // router.push('/dashboard-bio'); // Exemplo
    };

    // --- 3. BIO-PHYSICS ENGINE (DNA 3D Fluido) ---
    // (Código mantido idêntico ao original para preservar o fundo)
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

        const SPACING = 50; 
        const TOTAL_HEIGHT = BIO_TERMS.length * SPACING; 

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
                this.y -= speed;
                if (this.y < -100) {
                    this.y += TOTAL_HEIGHT;
                }

                const helixRadius = 140;
                const helixCenter = canvasW * 0.18;
                const frequency = 0.005; 

                const angle = (this.y * frequency) + (this.strand === 1 ? 0 : Math.PI);
                this.baseX = helixCenter + Math.cos(angle) * helixRadius;
                const baseZ = Math.sin(angle);

                let targetScale = 0.6 + (baseZ + 1) * 0.25;
                let targetOpacity = 0.4 + (baseZ + 1) * 0.4;

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

                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fillStyle = displayColor;
                ctx.globalAlpha = this.opacity;
                ctx.fill();

                if (isDark) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = displayColor;
                }

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

        BIO_TERMS.forEach((term, i) => {
            const strand = i % 2 === 0 ? 1 : 2;
            const startY = canvas.height + (i * SPACING);
            molecules.push(new Molecule(term, startY, strand));
        });

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDarkNow = document.documentElement.classList.contains('dark');

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
                    let started = false;

                    for (let i = 0; i < strandMols.length - 1; i++) {
                        const curr = strandMols[i];
                        const next = strandMols[i+1];

                        if (Math.abs(curr.y - next.y) < SPACING * 2.5) {
                            if (!started) {
                                ctx.moveTo(curr.x, curr.y);
                                started = true;
                            }
                            const midX = (curr.x + next.x) / 2;
                            const midY = (curr.y + next.y) / 2;
                            ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
                            ctx.quadraticCurveTo(midX, midY, next.x, next.y);
                        } else {
                            started = false; 
                        }
                    }
                }
                ctx.stroke();
            };

            molecules.forEach(m => m.update(canvas.width, 1.2));

            drawStrand(1);
            drawStrand(2);

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
        <div className={`relative w-screen h-screen overflow-hidden font-mono transition-colors duration-500
            bg-gray-100 
            dark:bg-[linear-gradient(to_bottom_right,_#065f46_0%,_#022c22_60%,_#000000_100%)]
        `}>

            {/* CAMADA 2: CANVAS (O DNA) */}
            <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

            {/* CAMADA 3: MODAL INFORMATIVO */}
            <AnimatePresence>
                {isLoaded && isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" // pointer-events-none no container
                    >
                        {/* O Modal em si tem pointer-events-auto para interagir */}
                        <div
                            ref={modalRef}
                            className={`pointer-events-auto w-full max-w-[440px] transition-all duration-300 relative
                            bg-white dark:bg-black border-2 border-gray-200 dark:border-green-900 shadow-xl dark:shadow-[0_0_40px_rgba(16,185,129,0.15)]
                            `}
                        >
                            {/* Top Bar (Visual Técnico) */}
                            <div className="border-b p-2 py-1.5 flex items-center justify-between select-none bg-green-900/20 border-green-800/50">
                                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-green-500">
                                    <Activity size={10} />
                                    <span>PROTOCOL_V2</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 border animate-pulse rounded-full bg-green-500 border-green-400"></div>
                                </div>
                            </div>

                            {/* Corpo */}
                            <div className="p-6 relative overflow-hidden">
                                {/* Scanline Effect */}
                                <div className="absolute inset-0 bg-[length:100%_3px] pointer-events-none z-0 opacity-0 dark:opacity-50
                                     bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.05)_50%)]"></div>

                                <div className="relative z-10 flex flex-col gap-5">
                                    {/* Header do Aviso */}
                                    <div className="border-l-2 pl-3 py-1 border-yellow-500 dark:border-yellow-600">
                                        <h2 className="text-base font-bold tracking-wider flex items-center gap-2 text-gray-800 dark:text-white">
                                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                            Usage Guidelines
                                        </h2>
                                        <p className="text-[10px] mt-1 uppercase tracking-widest text-gray-500 dark:text-green-500/70">
                                            Restricted Topic Environment
                                        </p>
                                    </div>

                                    {/* Texto Informativo */}
                                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-green-900/10 p-4 border border-gray-100 dark:border-green-800/30">
                                        <p className="mb-2 font-bold text-gray-800 dark:text-green-400">Attention, Researcher.</p>
                                        <p>
                                            You are entering a specialized study zone. To maintain the integrity of the data stream, please ensure all queries are strictly related to:
                                        </p>
                                        <ul className="mt-3 space-y-1 list-disc list-inside text-xs font-mono text-gray-500 dark:text-green-300">
                                            <li>Biology & Ecosystems</li>
                                            <li>Medicine & Pathology</li>
                                            <li>Health Sciences</li>
                                        </ul>
                                    </div>

                                    {/* Botão de Ação */}
                                    <button
                                        onClick={handleUnderstood}
                                        className="w-full mt-2 border font-bold py-3 text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 group duration-300
                                        bg-gray-100 border-gray-200 text-gray-600 hover:bg-green-600 hover:text-white hover:border-green-500
                                        dark:bg-green-800/40 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-600 dark:hover:text-white"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        Understood
                                    </button>
                                </div>
                            </div>

                            {/* Rodapé Técnico */}
                            <div className="border-t p-1.5 flex justify-between text-[7px] uppercase tracking-wider bg-gray-50 dark:bg-black/90 border-gray-100 dark:border-green-900/40 text-gray-400 dark:text-green-800/70">
                                <span>SECURE_CHANNEL_ESTABLISHED</span>
                                <span>WAITING_USER_INPUT</span>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ZaeonBiologyRoom;