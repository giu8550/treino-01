"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
    CalendarIcon, MapPinIcon, ArrowUpRightIcon, 
    BanknotesIcon, HeartIcon 
} from "@heroicons/react/24/outline";

const NEWS_DATA = [
    {
        id: 1,
        date: "DEC 07, 2024",
        category: "Funding",
        title: "Zaeon secures first installment of Centelha II Grant",
        description: "Historic Milestone: Official funding received under the 'Blockchain' category. Development of the decentralized infrastructure begins.",
        location: "Zaeon HQ, Brazil",
        icon: <BanknotesIcon className="w-4 h-4" />
    },
    {
        id: 2,
        date: "JAN 15, 2025",
        category: "Event",
        title: "Blockchain Week: Beta Protocol Presentation",
        description: "Strategic networking with angel investors and technical validation of the whitepaper.",
        location: "Sao Paulo, SP",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 3,
        date: "FEB 22, 2025",
        category: "Partnership",
        title: "Porto Digital Summit: Incubator Alliance",
        description: "Partnership signed for usability testing with startups from the Recife ecosystem.",
        location: "Recife, PE",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 4,
        date: "MAR 10, 2025",
        category: "Regulation",
        title: "Brasilia GovTech: Legal Framework Discussions",
        description: "Meeting with the Cryptoeconomy Working Group to align the project with Central Bank guidelines.",
        location: "Brasilia, DF",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 5,
        date: "APR 05, 2025",
        category: "Tech",
        title: "Floripa Dev Island: Core Dev Team Expansion",
        description: "Intensive workshop for recruiting Solidity and Rust specialists.",
        location: "Florianopolis, SC",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 6,
        date: "MAY 18, 2025",
        category: "Sustainability",
        title: "Manaus Bio-Forum: Green Assets Tokenization",
        description: "Case study for applying Zaeon blockchain in the traceability of Amazonian bio-actives.",
        location: "Manaus, AM",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 7,
        date: "JUN 20, 2025",
        category: "Global",
        title: "Web Summit Rio: The International Pitch",
        description: "Zaeon selected as an 'Alpha' startup, attracting attention from European funds.",
        location: "Rio de Janeiro, RJ",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 8,
        date: "JUL 12, 2025",
        category: "Community",
        title: "Fortaleza Crypto Beach: First Zaeon Meetup",
        description: "Gathering the local community to test the first version of the mobile wallet.",
        location: "Fortaleza, CE",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 9,
        date: "AUG 09, 2025",
        category: "Innovation",
        title: "San Pedro Valley: AI Integration",
        description: "Hackathon in BH focused on creating autonomous agents within the Zaeon network.",
        location: "Belo Horizonte, MG",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 10,
        date: "SEP 14, 2025",
        category: "Education",
        title: "Gramado Summit: Zaeon Academy Launch",
        description: "Presentation of the gamified learning platform for new user onboarding.",
        location: "Gramado, RS",
        icon: <MapPinIcon className="w-4 h-4" />
    },
    {
        id: 11,
        date: "OCT 02, 2025",
        category: "Statement",
        title: "Official Notice: Leadership Health & Restructuring",
        description: "Founder Evandro de Souza Martins announces temporary leave for liver health treatment. The roadmap remains unchanged under council management.",
        location: "Global Statement",
        icon: <HeartIcon className="w-4 h-4" />,
        isAlert: true
    }
];

export default function NewsModule() {
    return (
        <div className="w-full pb-20">
            <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0f172a] dark:text-white/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Corporate Timeline
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">2024 - 2025</span>
            </div>

            <div className="space-y-4">
                {NEWS_DATA.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className={`group relative p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1
                            ${item.isAlert 
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20' 
                                : 'bg-white/40 dark:bg-white/[0.03] border-black/5 dark:border-white/5 hover:border-[#0f172a]/20 dark:hover:border-white/20'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md 
                                    ${item.isAlert 
                                        ? 'bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-300' 
                                        : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                                    }`}>
                                    {item.date}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    {item.icon}
                                    {item.category}
                                </span>
                            </div>
                            
                            <div className={`p-2 rounded-full transition-colors 
                                ${item.isAlert 
                                    ? 'bg-red-100 dark:bg-red-500/20 text-red-600' 
                                    : 'bg-[#0f172a]/5 dark:bg-white/5 text-[#0f172a] dark:text-white group-hover:bg-[#0f172a] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black'
                                }`}>
                                <ArrowUpRightIcon className="w-4 h-4" />
                            </div>
                        </div>

                        <h4 className={`text-sm font-bold mb-2 leading-tight pr-8 
                            ${item.isAlert ? 'text-red-800 dark:text-red-100' : 'text-[#0f172a] dark:text-slate-200'}`}>
                            {item.title}
                        </h4>
                        
                        <p className={`text-xs leading-relaxed mb-4 line-clamp-2
                            ${item.isAlert ? 'text-red-700/70 dark:text-red-200/60' : 'text-slate-500 dark:text-slate-400'}`}>
                            {item.description}
                        </p>

                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                            <MapPinIcon className="w-3 h-3" />
                            {item.location}
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <div className="text-center mt-12 mb-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">End of recent updates</p>
            </div>
        </div>
    );
}