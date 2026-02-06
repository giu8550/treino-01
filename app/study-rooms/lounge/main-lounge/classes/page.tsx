"use client";

import React, { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Layers, MapPin, User, Activity, Clock, X, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data
const scheduleData = [
  { name: "Systems Arch.", teacher: "Dr. Aris", room: "Lab 402", days: [1, 3], hour: 8, color: "from-cyan-400 to-blue-500" },
  { name: "Neural Nets", teacher: "Prof. Sarah", room: "Hall B", days: [1, 3], hour: 10, color: "from-blue-500 to-indigo-600" },
  { name: "AI Ethics", teacher: "Marcus V.", room: "101", days: [2, 4], hour: 13, color: "from-teal-400 to-emerald-500" },
  { name: "React Flow", teacher: "Lucas N.", room: "Virtual", days: [2, 4], hour: 15, color: "from-violet-500 to-fuchsia-500" },
  { name: "DB Design", teacher: "Elena R.", room: "Lab 105", days: [5], hour: 9, color: "from-orange-400 to-red-500" },
  { name: "CyberSec", teacher: "Jack R.", room: "Sec Lab", days: [1, 5], hour: 14, color: "from-sky-400 to-cyan-500" },
  { name: "UI Design", teacher: "Sofia B.", room: "Studio", days: [3], hour: 15, color: "from-pink-400 to-rose-500" },
];

export default function LessonsModule() {
  const [showYearBoard, setShowYearBoard] = useState(true);
  const [selectedClass, setSelectedClass] = useState(scheduleData[0]);
  
  // Estado para gerenciar múltiplas notas
  const [notes, setNotes] = useState([
    { id: 1, text: "All you need, is a pencil, paper and Zaeon. No more thousands of tabs, no more copy and paste from GPT. We got you.", x: 0, y: 0 }
  ]);
  
  const constraintsRef = useRef(null);

  // Generate 365 days mock
  const yearSquares = Array.from({ length: 365 }, (_, i) => Math.floor(Math.random() * 4));
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = Array.from({ length: 9 }, (_, i) => i + 8);

  const formatTime = (h: number) => `${h.toString().padStart(2, '0')}:00 - ${(h + 2).toString().padStart(2, '0')}:00`;

  // Funções para gerenciar notas
  const addNote = () => {
    const newNote = {
      id: Date.now(),
      text: "",
      x: Math.random() * 50, // Posição levemente aleatória para não sobrepor totalmente
      y: Math.random() * 50
    };
    setNotes([...notes, newNote]);
  };

  const removeNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const updateNoteText = (id: number, newText: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, text: newText } : note));
  };

  return (
    <div ref={constraintsRef} className="relative min-h-screen w-full flex flex-col items-center p-8 overflow-hidden bg-[#0a0a0a] font-sans selection:bg-cyan-500/30 rounded-3xl">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[0%] right-[-5%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none"></div>

      {/* --- SECTION 1: THE GLASS BAR --- */}
      <section className="w-full max-w-[1400px] z-10 transition-all duration-700 pointer-events-auto">
        <div className="flex justify-between items-center px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Activity size={14} className="text-cyan-300" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">Annual Flow</h3>
          </div>
          <button
            onClick={() => setShowYearBoard(!showYearBoard)}
            className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full backdrop-blur-md"
          >
            {showYearBoard ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showYearBoard && (
          <div className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] 
                          shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-20px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto pb-2 scrollbar-hide mask-fade-sides">
              <div className="grid grid-rows-7 grid-flow-col gap-[4px] w-max min-w-full">
                {yearSquares.map((level, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${level === 0 ? 'bg-white/5' :
                      level === 1 ? 'bg-cyan-900/40 shadow-[0_0_5px_rgba(8,145,178,0.2)]' :
                        level === 2 ? 'bg-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]' :
                          'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-110'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ESPAÇO */}
      <div className="h-24 pointer-events-none"></div>

      {/* --- SECTION 2: DRAGGABLE CARDS --- */}
      <div className="flex justify-center gap-12 flex-wrap z-20 relative w-full h-full items-start">

        {/* CARD 1: GLASS SCHEDULE */}
        <motion.div
          drag
          dragConstraints={constraintsRef}
          whileHover={{ scale: 1.02, cursor: "grab" }}
          whileDrag={{ scale: 1.05, cursor: "grabbing", zIndex: 100, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
          className="group w-80 h-52 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] 
                            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.6)]
                            flex flex-col items-center justify-between relative overflow-hidden">
            <div className="w-full flex justify-between items-center mb-2 pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Weekly Agenda</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              </div>
            </div>
            <div className="w-full flex gap-3 justify-between h-full pointer-events-none">
              {days.map((day, dIdx) => (
                <div key={day} className="flex flex-col gap-[3px] h-full flex-1 items-center">
                  <div className="flex-1 flex flex-col justify-between w-full pointer-events-auto">
                    {hours.map((hour) => {
                      const classAtTime = scheduleData.find(c => c.days.includes(dIdx + 1) && c.hour === hour);
                      const isSelected = classAtTime && selectedClass.name === classAtTime.name;
                      return (
                        <div
                          key={`${day}-${hour}`}
                          onPointerDown={() => classAtTime && setSelectedClass(classAtTime)}
                          className={`w-full flex-1 rounded-[2px] cursor-pointer transition-all duration-300
                                            ${classAtTime
                              ? `bg-gradient-to-br ${classAtTime.color} ${isSelected ? 'shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10 scale-110 ring-1 ring-white/50' : 'opacity-70 hover:opacity-100'}`
                              : 'bg-white/5 hover:bg-white/10'
                            }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[8px] text-white/30 font-bold mt-2">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CARD 2: DETAILS */}
        <motion.div
          drag
          dragConstraints={constraintsRef}
          whileHover={{ scale: 1.05, cursor: "grab" }}
          whileDrag={{ scale: 1.1, cursor: "grabbing", zIndex: 100 }}
          className="group w-52 h-52 relative"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${selectedClass.color} opacity-20 rounded-[2.5rem] blur-2xl transition-all duration-700 pointer-events-none`}></div>
          <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] 
                            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.6)]
                            flex flex-col justify-between relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${selectedClass.color} rounded-full blur-[40px] opacity-40 animate-pulse pointer-events-none`}></div>
            <div className="relative z-10 flex justify-between items-start pointer-events-none">
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full border border-white/5">
                <MapPin size={10} className="text-white/80" />
                <span className="text-[9px] font-bold text-white/90">{selectedClass.room}</span>
              </div>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedClass.color} shadow-[0_0_10px_currentColor]`}></div>
            </div>
            <div className="relative z-10 pointer-events-none mt-2">
              <h2 className="text-sm font-bold text-white leading-tight drop-shadow-md mb-2">{selectedClass.name}</h2>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Clock size={12} />
                <span className="text-[10px] font-mono font-medium tracking-wide">
                  {formatTime(selectedClass.hour)}
                </span>
              </div>
            </div>
            <div className="relative z-10 bg-white/5 border border-white/10 p-2 rounded-xl flex items-center gap-2 backdrop-blur-md pointer-events-none mt-auto">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-white/70 shrink-0">
                <User size={10} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[7px] uppercase text-white/30 font-bold">Mentor</span>
                <span className="text-[9px] font-medium text-white/90 truncate">
                  {selectedClass.teacher}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- STICKY NOTES ARRAY --- */}
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }} // Sem rotação inicial
              animate={{ opacity: 1, scale: 1, y: 0 }}   // Sem rotação
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              drag
              dragConstraints={constraintsRef}
              whileHover={{ scale: 1.02, cursor: "grab" }}
              whileDrag={{ scale: 1.1, cursor: "grabbing", zIndex: 100 }}
              className="absolute group w-48 h-48 z-30" // Aumentei um pouco o tamanho
              style={{ top: note.y || 50, right: note.x || 50, position: 'relative' }} // Posição relativa ao flex container ou absoluta se preferir tirar do fluxo
            >
                {/* Glow Ambar Sutil */}
                <div className="absolute inset-0 bg-yellow-500/5 rounded-[2rem] blur-xl transition-opacity duration-700 pointer-events-none"></div>

                <div className="w-full h-full bg-yellow-900/10 backdrop-blur-xl border border-yellow-500/10 p-5 rounded-[2rem] 
                                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_15px_30px_-10px_rgba(0,0,0,0.5)]
                                flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Botão de Fechar (Direita) */}
                    <button 
                        onClick={() => removeNote(note.id)}
                        className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 z-20"
                        title="Delete note"
                    >
                        <X size={14} />
                    </button>

                    {/* Botão de Adicionar (Esquerda) */}
                    <button 
                        onClick={addNote}
                        className="absolute top-3 left-3 text-white/20 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 z-20"
                        title="Create new note"
                    >
                        <Plus size={14} />
                    </button>

                    <div className="flex items-center gap-2 text-yellow-500/80 mb-1 mt-4 pointer-events-none">
                        <AlertCircle size={12} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Note</span>
                    </div>

                    {/* Área de Texto Editável */}
                    <textarea 
                        className="w-full h-full bg-transparent border-none outline-none resize-none text-[11px] text-white/80 font-medium font-mono placeholder-white/20 leading-relaxed scrollbar-hide z-10"
                        placeholder="Type your note here..."
                        value={note.text}
                        onChange={(e) => updateNoteText(note.id, e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()} // Permite clicar no texto sem arrastar
                    />

                    <div className="h-0.5 w-12 bg-yellow-500/20 rounded-full mt-2 self-end pointer-events-none"></div>
                </div>
            </motion.div>
          ))}
        </AnimatePresence>

      </div>

      {/* FOOTER */}
      <div className="mt-20 pointer-events-auto">
        <button className="group relative px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md transition-all">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-colors">
            Zaeon is looking for funding to bring the closed beta, open for everyone. 
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
        </button>
      </div>
      
      {/* Chat Offline */}
   

    </div>
  );
}