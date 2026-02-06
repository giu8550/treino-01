"use client";

import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "src/context/Web3Context";
import { ZAEON_CONFIG, ABIS } from "src/config/contracts";
import { 
    CpuChipIcon, 
    BeakerIcon, 
    CurrencyDollarIcon, 
    SparklesIcon, 
    UserGroupIcon,
    ServerStackIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
    CubeTransparentIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

// --- TYPES & GENERATOR ---

interface Requirements {
    type: 'complex' | 'simple';
    phds: number;
    masters: number;
    agents: number;
}

interface ProjectIdea {
    id: string;
    agentName: string;
    avatarColor: string;
    domain: string;
    title: string;
    description: string;
    requirements: Requirements;
    isMinted: boolean; // True se veio do blockchain
}

// Gerador Procedural para criar 77+ ideias únicas
const generateIdeas = (count: number): ProjectIdea[] => {
    const domains = ["Bioengineering", "Quantum Comp", "Neural Arch", "Medicine", "Civil Eng", "Astrophysics", "Chemistry", "Mathematics"];
    const agentPrefixes = ["Nexus", "Alpha", "Core", "Synth", "Omin", "Zeta", "Prime", "Unit", "Echo", "Flux", "Cyber"];
    const agentSuffixes = ["v1", "X", "Zero", "Mind", "Flow", "Net", "Bot", "AI", "Soul"];
    
    const actions = ["Optimization of", "Simulation for", "Autonomous", "Structural Analysis of", "Molecular Folding for", "Predictive Model for", "Encryption of", "Drone Swarm for"];
    const targets = ["Protein Structures", "Traffic Flow", "Surgical Precision", "Bridge Loads", "Dark Matter", "Cryptography Keys", "Gene Editing", "Fluid Dynamics", "Neural Pathways"];

    return Array.from({ length: count }).map((_, i) => {
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const isComplex = Math.random() > 0.6; // 40% chance de ser complexo
        
        return {
            id: `idea-${i}`,
            agentName: `${agentPrefixes[Math.floor(Math.random() * agentPrefixes.length)]}-${agentSuffixes[Math.floor(Math.random() * agentSuffixes.length)]}`,
            avatarColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
            domain: domain,
            title: `${actions[Math.floor(Math.random() * actions.length)]} ${targets[Math.floor(Math.random() * targets.length)]}`,
            description: `A ${domain.toLowerCase()} protocol designed to leverage distributed intelligence.`,
            isMinted: false,
            requirements: {
                type: isComplex ? 'complex' : 'simple',
                phds: isComplex ? Math.floor(Math.random() * 2) + 1 : 0,
                masters: isComplex ? Math.floor(Math.random() * 3) + 1 : 0,
                agents: Math.floor(Math.random() * 5) + 3
            }
        };
    });
};

// --- COMPONENT: CARD ---
function ProjectCard({ 
    data, 
    isInLab, 
    onDragEnd, 
    onClaim 
}: { 
    data: ProjectIdea; 
    isInLab: boolean; 
    onDragEnd?: (data: ProjectIdea) => void;
    onClaim?: (id: string) => void;
}) {
    const controls = useDragControls();

    return (
        <motion.div
            layoutId={data.id}
            drag={!isInLab} // Só arrasta se estiver na esquerda (stream)
            dragControls={controls}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Snap back se não soltar no alvo
            dragElastic={0.2}
            onDragEnd={(_, info) => {
                // Se arrastou o suficiente para a direita (> 200px), move
                if (!isInLab && info.offset.x > 150 && onDragEnd) {
                    onDragEnd(data);
                }
            }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileDrag={{ scale: 1.05, zIndex: 100, cursor: "grabbing" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative group rounded-[2rem] border backdrop-blur-xl overflow-hidden transition-colors duration-500
                ${isInLab 
                    ? "w-full mb-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-cyan-500/30 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]" 
                    : "w-full mb-3 bg-white/5 border-white/5 cursor-grab active:cursor-grabbing hover:border-white/20"
                }`}
        >
            {/* Glow Effect on Drag (Left Side) */}
            {!isInLab && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            )}

            <div className="p-5 relative z-10">
                {/* Header: Agent Profile */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-lg"
                            style={{ backgroundColor: data.avatarColor }}
                        >
                            {data.agentName.substring(0, 2)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{data.agentName}</h4>
                                {data.isMinted && <CheckBadgeIcon className="w-3 h-3 text-cyan-400" />}
                            </div>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                                {data.domain}
                            </span>
                        </div>
                    </div>
                    
                    {/* Visual Indicator to Drag */}
                    {!isInLab && (
                        <div className="text-white/20 group-hover:translate-x-1 transition-transform">
                            <ArrowRightIcon className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white mb-2 leading-tight">
                    {data.title}
                </h3>

                {/* --- EXPANDED DETAILS (ONLY IN LAB) --- */}
                <AnimatePresence>
                    {isInLab && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <SparklesIcon className="w-3 h-3 text-yellow-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80">
                                        Requirements Unlocked
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {data.requirements.type === 'complex' && (
                                        <>
                                            <div className="bg-black/20 rounded-xl p-2 flex items-center gap-2 border border-white/5">
                                                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                    <span className="text-xs font-bold">{data.requirements.phds}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-white/60 uppercase">Doctorate</span>
                                            </div>
                                            <div className="bg-black/20 rounded-xl p-2 flex items-center gap-2 border border-white/5">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <span className="text-xs font-bold">{data.requirements.masters}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-white/60 uppercase">Masters</span>
                                            </div>
                                        </>
                                    )}
                                    <div className={`${data.requirements.type === 'simple' ? 'col-span-2' : ''} bg-black/20 rounded-xl p-2 flex items-center gap-2 border border-white/5`}>
                                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                            <span className="text-xs font-bold">{data.requirements.agents}</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-white/60 uppercase">AI Agents</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                {data.isMinted ? (
                                    <button 
                                        onClick={() => onClaim && onClaim(data.id.replace('asset-', ''))}
                                        className="w-full py-3 bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        <CurrencyDollarIcon className="w-4 h-4" /> Claim Funding
                                    </button>
                                ) : (
                                    <div className="w-full py-3 bg-white/5 border border-white/10 text-white/30 rounded-xl text-[10px] font-bold uppercase text-center cursor-not-allowed">
                                        Ready for Minting
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// --- MAIN MODULE ---
export default function ProjectsModule() {
    const { account, signer } = useWeb3();
    const [streamIdeas, setStreamIdeas] = useState<ProjectIdea[]>([]);
    const [labProjects, setLabProjects] = useState<ProjectIdea[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Initialize Ideas
    useEffect(() => {
        setStreamIdeas(generateIdeas(77));
    }, []);

    // Web3: Fetch Real Assets and merge into Lab
    useEffect(() => {
        if(!account || !signer) return;
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const asset = new ethers.Contract(ZAEON_CONFIG.ADDRESSES.ASSET, ABIS.ASSET, signer);
                const filter = asset.filters.Transfer(null, account);
                const events = await asset.queryFilter(filter);
                
                // Transform Web3 assets into ProjectIdea format
                const realAssets: ProjectIdea[] = events.map((e: any) => {
                    const id = e.args[2].toString();
                    return {
                        id: `asset-${id}`,
                        agentName: "Zaeon-Core",
                        avatarColor: "#06b6d4",
                        domain: "Blockchain RWA",
                        title: `Minted Research Asset #${id}`,
                        description: "Verified on-chain asset.",
                        isMinted: true,
                        requirements: { type: 'complex', phds: 1, masters: 1, agents: 5 }
                    };
                });

                // Add to Lab if not already there
                setLabProjects(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newAssets = realAssets.filter(a => !existingIds.has(a.id));
                    return [...newAssets, ...prev];
                });
            } catch (e) {
                console.error("Chain Error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, [account, signer]);

    const handleClaim = async (id: string) => {
        if(!signer) return;
        try {
            const treasury = new ethers.Contract(ZAEON_CONFIG.ADDRESSES.TREASURY, ABIS.TREASURY, signer);
            const tx = await treasury.claimResearchFunding(id, ZAEON_CONFIG.INTENT.GENESIS, "0x");
            await tx.wait();
            alert("Funding Claimed Successfully!");
        } catch(e) { console.error(e); alert("Claim failed."); }
    };

    // Move from Stream to Lab
    const handleMoveToLab = (idea: ProjectIdea) => {
        setStreamIdeas(prev => prev.filter(p => p.id !== idea.id));
        setLabProjects(prev => [idea, ...prev]);
    };

    return (
        <div className="w-full h-screen bg-[#0a0a0a] rounded-[3rem] overflow-hidden relative p-8 flex gap-8">
            
            {/* AMBIENT BACKGROUND */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[150px] animate-pulse duration-[8000ms]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[150px]"></div>
            </div>

            {/* --- LEFT: IDEAS STREAM --- */}
            <div className="w-1/3 flex flex-col gap-4 relative z-10 h-full">
                <div className="flex items-center gap-2 px-2">
                    <CpuChipIcon className="w-5 h-5 text-white/50" />
                    <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/50">
                        Global Ideas Stream <span className="text-white/20">({streamIdeas.length})</span>
                    </h2>
                </div>

                {/* Stream Container */}
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 pb-20 mask-fade-bottom">
                    {streamIdeas.map((idea) => (
                        <ProjectCard 
                            key={idea.id} 
                            data={idea} 
                            isInLab={false} 
                            onDragEnd={handleMoveToLab}
                        />
                    ))}
                    {streamIdeas.length === 0 && (
                        <div className="text-center p-10 text-white/20 text-xs uppercase tracking-widest">
                            Stream Depleted
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT: MY LAB (DROP ZONE) --- */}
            <div className="flex-1 flex flex-col gap-4 relative z-10 h-full">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <BeakerIcon className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                            My Project Lab
                        </h2>
                    </div>
                    {loading && <span className="text-[9px] text-cyan-500/50 animate-pulse">SYNCING CHAIN...</span>}
                </div>

                {/* Lab Container (Glass) */}
                <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative overflow-hidden">
                    
                    {/* Empty State / Drop Target Hint */}
                    {labProjects.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 pointer-events-none">
                            <CubeTransparentIcon className="w-24 h-24 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">Drag Ideas Here</p>
                        </div>
                    )}

                    <div className="h-full overflow-y-auto scrollbar-hide pr-2 pb-20 mask-fade-bottom">
                         {/* Lista de Projetos (LayoutGroup para animação suave) */}
                         <div className="flex flex-col gap-4">
                            {labProjects.map((project) => (
                                <ProjectCard 
                                    key={project.id} 
                                    data={project} 
                                    isInLab={true}
                                    onClaim={handleClaim}
                                />
                            ))}
                         </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                </div>
            </div>

        </div>
    );
}