"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Calendar, Beaker, FileText } from 'lucide-react';

const BIO_LESSONS = [
    { id: 1, title: "Intro to CRISPR/Cas9", type: "Live Lab", time: "10:00 AM", status: "live", tutor: "Dr. Sarah Connors" },
    { id: 2, title: "Mitochondrial DNA Analysis", type: "Lecture", time: "02:00 PM", status: "upcoming", tutor: "Prof. X" },
    { id: 3, title: "Organic Chemistry: Lipids", type: "Workshop", time: "Yesterday", status: "recorded", tutor: "Dr. Octavius" },
    { id: 4, title: "Neural Networks in Biology", type: "Seminar", time: "2 days ago", status: "recorded", tutor: "AI Proctor" },
];

export default function LessonsModule() {
  return (
    <div className="w-full flex flex-col gap-6 text-emerald-50">
        {/* HEADER */}
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white">Lab Schedule</h2>
                <p className="text-xs text-emerald-400/60 font-mono">Current Semester: BIO-2026</p>
            </div>
            <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase text-emerald-400 animate-pulse">
                • Network Online
            </div>
        </div>

        {/* LISTA DE AULAS */}
        <div className="grid grid-cols-1 gap-4">
            {BIO_LESSONS.map((lesson, idx) => (
                <motion.div 
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-[#022c22]/40 border border-emerald-500/10 hover:bg-[#022c22]/80 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lesson.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {lesson.status === 'live' ? <PlayCircle size={20} /> : <Beaker size={20} />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors">{lesson.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-emerald-500/60 font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={10} /> {lesson.type}</span>
                                    <span className="flex items-center gap-1"><Clock size={10} /> {lesson.time}</span>
                                </div>
                            </div>
                        </div>
                        
                        <button className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                            lesson.status === 'live' 
                            ? 'bg-red-500 hover:bg-red-400 text-black shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                            : 'bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/5'
                        }`}>
                            {lesson.status === 'live' ? 'Join Stream' : lesson.status === 'recorded' ? 'Watch Replay' : 'Remind Me'}
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* MATERIALS SECTION */}
        <div className="mt-4">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><FileText size={16} /> Course Materials</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Cell_Structure_PDF', 'DNA_Sequencing_Log', 'Lab_Safety_Protocol'].map((file, i) => (
                    <div key={i} className="p-3 bg-emerald-900/20 border border-emerald-500/10 rounded-xl hover:border-emerald-500/40 cursor-pointer transition-colors">
                        <div className="text-[10px] text-emerald-500/50 uppercase mb-1">DOC v2.0</div>
                        <div className="text-xs font-bold text-emerald-100 truncate">{file}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}