"use client";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "src/context/Web3Context";
import { ZAEON_CONFIG, ABIS } from "src/config/contracts";
import { ClipboardDocumentCheckIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export default function ProjectsModule() {
    const { account, signer } = useWeb3();
    const [myAssets, setMyAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(!account || !signer) return;
        const fetchAssets = async () => {
            setLoading(true);
            const asset = new ethers.Contract(ZAEON_CONFIG.ADDRESSES.ASSET, ABIS.ASSET, signer);
            
            // Simplified: Scan Transfer events to find owned tokens
            // In production, use The Graph or an Enumerable extension
            const filter = asset.filters.Transfer(null, account);
            const events = await asset.queryFilter(filter);
            
            const assetsFound = events.map((e: any) => ({
                id: e.args[2].toString(),
                status: "Minted"
            }));
            setMyAssets(assetsFound);
            setLoading(false);
        };
        fetchAssets();
    }, [account, signer]);

    // Claim Funding Logic
    const claimFunding = async (id: string) => {
        if(!signer) return;
        try {
            const treasury = new ethers.Contract(ZAEON_CONFIG.ADDRESSES.TREASURY, ABIS.TREASURY, signer);
            const tx = await treasury.claimResearchFunding(id, ZAEON_CONFIG.INTENT.GENESIS, "0x");
            await tx.wait();
            alert("Funding Claimed!");
        } catch(e) { console.error(e); alert("Claim failed or already funded."); }
    };

    return (
        <div className="space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest dark:text-white mb-6">My Assets (RWA)</h3>
             
             {loading && <div className="text-xs text-slate-500">Scanning Blockchain...</div>}
             
             {myAssets.length === 0 && !loading && (
                 <div className="p-8 rounded-3xl bg-white/5 text-center text-xs text-slate-500">
                    No Assets found. Go to Research to mint one.
                 </div>
             )}

             {myAssets.map((asset) => (
                 <div key={asset.id} className="p-6 rounded-3xl bg-[#0f172a]/5 dark:bg-white/5 border border-[#0f172a]/10 dark:border-white/10 flex justify-between items-center">
                    <div>
                        <h4 className="text-sm font-bold dark:text-white">Research Asset #{asset.id}</h4>
                        <span className="text-[10px] text-slate-500 uppercase">Verified via x402</span>
                    </div>
                    <button 
                        onClick={() => claimFunding(asset.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-[10px] font-bold uppercase hover:bg-green-600 hover:text-white transition-all"
                    >
                        <CurrencyDollarIcon className="w-4 h-4" /> Claim Treasury
                    </button>
                 </div>
             ))}
        </div>
    );
}