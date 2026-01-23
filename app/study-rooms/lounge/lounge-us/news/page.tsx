"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { BanknotesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { ZAEON_CONFIG, ABIS } from "src/config/contracts";

// Keep your existing NEWS_DATA constant here...
const NEWS_DATA = [ null ]; // Your original array

export default function NewsModule() {
    const [liveEvents, setLiveEvents] = useState<any[]>([]);

    useEffect(() => {
        // Setup a Read-Only Provider (No wallet needed to view news)
        const provider = new ethers.JsonRpcProvider(ZAEON_CONFIG.RPC_URL);
        const treasury = new ethers.Contract(ZAEON_CONFIG.ADDRESSES.TREASURY, ABIS.TREASURY, provider);

        const fetchEvents = async () => {
            // Get events from the last 10000 blocks (or simply listen)
            try {
                const events = await treasury.queryFilter("FundsAllocated"); 
                const formattedEvents = events.reverse().map((e: any, i) => ({
                    id: `live-${i}`,
                    date: "LIVE NOW",
                    category: "Autonomous Funding",
                    title: `Treasury Allocation: Token #${e.args[1]}`,
                    description: `Agent ${e.args[0].slice(0,6)}... received ${ethers.formatEther(e.args[2])} CRO via Algorithmic Governance.`,
                    location: "On-Chain (Cronos)",
                    icon: <BanknotesIcon className="w-4 h-4" />,
                    isLive: true
                }));
                setLiveEvents(formattedEvents);
            } catch(err) { console.log("Error fetching treasury events", err); }
        };

        fetchEvents();
        // Setup Listener
        const listener = (agent: string, tokenId: bigint, amount: bigint) => {
             const newEvent = {
                id: `live-new-${Date.now()}`,
                date: "JUST NOW",
                category: "Autonomous Funding",
                title: `Treasury Allocation: Token #${tokenId}`,
                description: `Agent ${agent.slice(0,6)}... received ${ethers.formatEther(amount)} CRO.`,
                location: "On-Chain (Cronos)",
                icon: <BanknotesIcon className="w-4 h-4" />,
                isLive: true
             };
             setLiveEvents(prev => [newEvent, ...prev]);
        };
        
        treasury.on("FundsAllocated", listener);
        return () => { treasury.off("FundsAllocated", listener); };
    }, []);

    // Merge Live Data + Historical Data
    const combinedData = [...liveEvents, ...NEWS_DATA];

    return (
        <div className="w-full pb-20">
             {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0f172a] dark:text-white/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Protocol Feed
                </h3>
            </div>

            <div className="space-y-4">
                {combinedData.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg 
                            ${item.isLive 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : 'bg-white/40 dark:bg-white/[0.03] border-black/5 dark:border-white/5'
                            }`}
                    >
                         {/* Render logic same as your original, just handling 'isLive' styling */}
                        <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${item.isLive ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {item.date}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    {item.icon} {item.category}
                                </span>
                            </div>
                        </div>
                        <h4 className="text-sm font-bold dark:text-white mb-2">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}