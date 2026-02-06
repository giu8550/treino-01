"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Clock, CheckCircle, TrendingUp, MessageCircle, MoreHorizontal, User, Sparkles, Send } from 'lucide-react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---

const chatMessages = [
  { id: 1, user: "Alice", avatar: "bg-purple-500", text: "I've drunk so much coffee I can see sounds ☕️" },
  { id: 2, user: "Bob", avatar: "bg-blue-500", text: "Anyone else panicking about the bio-sim module?" },
  { id: 3, user: "Charlie", avatar: "bg-green-500", text: "Just remember: When in doubt, choose 'C'. Works 20% of the time." },
  { id: 4, user: "Diana", avatar: "bg-pink-500", text: "Is the pre-test graded? I'm not ready." },
  { id: 5, user: "Evan", avatar: "bg-orange-500", text: "No, just practice! Don't stress." },
  { id: 6, user: "Faye", avatar: "bg-teal-500", text: "After this, we are getting pizza. Mandatory attendance. 🍕" },
  { id: 7, user: "Greg", avatar: "bg-indigo-500", text: "My brain is returning a 404 error." },
  { id: 8, user: "Hana", avatar: "bg-rose-500", text: "Good luck everyone! We got this! 🚀" },
  { id: 9, user: "Ian", avatar: "bg-cyan-500", text: "Wait, was chapter 4 included??" },
  { id: 10, user: "Jen", avatar: "bg-emerald-500", text: "Yes Ian, read the syllabus lol" },
];

const pastExams = [
  { 
    id: 1, 
    subject: "Genetic Algorithms I", 
    grade: "A+", 
    score: 98, 
    date: "Oct 12, 2025",
    color: "from-emerald-400 to-green-500",
    teacher: "Dr. Aris",
    comment: "Exceptional work on the mutation logic. Your optimization code was cleaner than the example."
  },
  { 
    id: 2, 
    subject: "AI Ethics & Law", 
    grade: "A", 
    score: 94, 
    date: "Oct 05, 2025",
    color: "from-blue-400 to-indigo-500",
    teacher: "Prof. Sarah",
    comment: "Strong arguments on the 'Trolley Problem' variations. Work on citing more recent case studies."
  },
  { 
    id: 3, 
    subject: "Neural Networks Intro", 
    grade: "B+", 
    score: 88, 
    date: "Sep 28, 2025",
    color: "from-amber-400 to-orange-500",
    teacher: "Marcus V.",
    comment: "Good grasp of the concepts, but you struggled slightly with the backpropagation math in Q3."
  }
];

export default function ExamsModule() {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on load
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="relative w-full flex flex-col gap-8 p-4 font-sans text-slate-200">
      
      {/* --- SECTION 1: NEXT ASSESSMENT (HERO + IMPRESSIONS) --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative group"
      >
        {/* Ambient Glow behind the card */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-50 pointer-events-none"></div>

        {/* GLASS CARD CONTAINER */}
        <div className="relative w-full min-h-[340px] bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col lg:flex-row gap-8 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-20px_rgba(0,0,0,0.7)]">
            
            {/* Left Side: Exam Info */}
            <div className="flex-1 flex flex-col justify-between z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                            Upcoming
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">ID: LV3-BIO</span>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white leading-tight mb-2 drop-shadow-md">
                        Certification: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Bioengineering & Auto-Sys
                        </span>
                    </h2>
                    
                    <p className="text-sm text-white/60 max-w-md leading-relaxed">
                        This is how hundreds of students are doing their exams. We are trying to make education more fun and engaging. and making it easier for teachers to apply their knowledge.
                        Help us go online, fund our research and development.
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-[#0a0a0a]/40 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md">
                        <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-white/40 font-bold">Time Remaining</span>
                            <span className="text-sm font-mono font-bold text-white">24h : 00m : 00s</span>
                        </div>
                    </div>

                    <button className="group relative px-8 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <span className="relative z-10">Start Pre-test</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </div>
            </div>

            {/* Right Side: IMPRESSIONS (Chat) */}
            <div className="w-full lg:w-96 h-72 bg-black/40 border border-white/5 rounded-3xl p-4 flex flex-col relative overflow-hidden shadow-inner">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 z-10">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                             <MessageCircle size={14} className="text-white/70" />
                             <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                             <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Impressions</span>
                    </div>
                    <span className="text-[9px] text-white/30">Live Feed</span>
                </div>

                {/* Messages Area (Scrollable) */}
                <div 
                    ref={chatScrollRef}
                    className="flex-1 flex flex-col space-y-3 overflow-y-auto scrollbar-hide mask-fade-top pr-1"
                >
                    <div className="h-4"></div> {/* Spacer for scroll */}
                    {chatMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-2 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className={`w-6 h-6 rounded-full ${msg.avatar} flex items-center justify-center text-[10px] font-bold text-white shadow-lg mt-1 shrink-0`}>
                                {msg.user[0]}
                            </div>
                            <div className="bg-white/10 border border-white/5 backdrop-blur-md rounded-2xl rounded-tl-none px-3 py-2 max-w-[85%] hover:bg-white/15 transition-colors cursor-default">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="text-[9px] font-bold text-white/40 mr-2">{msg.user}</span>
                                </div>
                                <p className="text-[11px] text-white/90 leading-snug font-medium">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Input Fake */}
                <div className="mt-3 relative z-10">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-1 py-1 pl-3">
                        <input 
                            disabled 
                            placeholder="Share your thoughts..." 
                            className="w-full bg-transparent text-[10px] text-white/50 placeholder:text-white/20 focus:outline-none cursor-not-allowed" 
                        />
                        <button className="p-1.5 rounded-full bg-white/10 text-white/40">
                            <Send size={12} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </motion.div>


      {/* --- SECTION 2: PAST RESULTS (DARK GLASS CARDS - FORCED STYLE) --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
            <TrendingUp size={16} className="text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Performance History</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {pastExams.map((exam, index) => (
                <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    // Forces dark glass look even in light mode: bg-[#0a0a0a]/80 and text-white
                    className="group relative w-full bg-[#0a0a0a]/80 backdrop-blur-xl hover:bg-[#0a0a0a] border border-white/5 hover:border-white/10 rounded-[2rem] p-6 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center shadow-lg"
                >
                    {/* Left: Score Visuals */}
                    <div className="flex items-center gap-6 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-4">
                        <div className="relative">
                            {/* Grade Circle Glow */}
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${exam.color} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                            <div className="relative w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center z-10">
                                <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br ${exam.color}`}>
                                    {exam.grade}
                                </span>
                            </div>
                            {/* Checkmark Badge */}
                            <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-1 border border-white/10 z-20">
                                <CheckCircle size={14} className="text-green-500" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">{exam.subject}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono text-white/40">{exam.date}</span>
                                <div className="h-1 w-1 rounded-full bg-white/20"></div>
                                <span className="text-[10px] font-bold text-white/60">Score: {exam.score}%</span>
                            </div>
                            {/* Mini Progress Bar */}
                            <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className={`h-full bg-gradient-to-r ${exam.color}`} 
                                    style={{ width: `${exam.score}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Teacher Commentary (Glass Bubble Style) */}
                    <div className="flex-1 w-full flex gap-4 items-start relative">
                         {/* Teacher Avatar */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                <User size={18} className="text-white/50" />
                            </div>
                            <span className="text-[9px] font-bold text-white/30 text-center w-12 truncate">{exam.teacher}</span>
                        </div>

                        {/* Speech Bubble */}
                        <div className="relative flex-1">
                            {/* Little triangle for speech bubble */}
                            <div className="absolute top-3 -left-1.5 w-3 h-3 bg-white/5 border-l border-b border-white/10 transform rotate-45"></div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles size={10} className="text-yellow-500/80" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Feedback</span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed font-medium">
                                    "{exam.comment}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decor Elements */}
                    <MoreHorizontal className="absolute top-6 right-6 text-white/10 group-hover:text-white/40 cursor-pointer transition-colors" size={20} />
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}