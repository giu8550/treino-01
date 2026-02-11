"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, User, Activity, Clock, ChevronUp, ChevronDown, 
  Power, Send, Sparkles, X, AlertCircle, StickyNote 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INITIAL DATA ---
const initialSchedule = [
  { id: 1, name: "Systems Arch.", teacher: "Dr. Aris", room: "Lab 402", days: [1, 3], hour: 8, color: "from-cyan-400 to-blue-500" },
  { id: 2, name: "Neural Nets", teacher: "Prof. Sarah", room: "Hall B", days: [1, 3], hour: 10, color: "from-blue-500 to-indigo-600" },
  { id: 3, name: "AI Ethics", teacher: "Marcus V.", room: "101", days: [2, 4], hour: 13, color: "from-teal-400 to-emerald-500" },
  { id: 4, name: "React Flow", teacher: "Lucas N.", room: "Virtual", days: [2, 4], hour: 15, color: "from-violet-500 to-fuchsia-500" },
  { id: 5, name: "DB Design", teacher: "Elena R.", room: "Lab 105", days: [5], hour: 9, color: "from-orange-400 to-red-500" },
  { id: 6, name: "CyberSec", teacher: "Jack R.", room: "Sec Lab", days: [1, 5], hour: 14, color: "from-sky-400 to-cyan-500" },
  { id: 7, name: "UI Design", teacher: "Sofia B.", room: "Studio", days: [3], hour: 15, color: "from-pink-400 to-rose-500" },
];

export default function LessonsModule() {
  const [showYearBoard, setShowYearBoard] = useState(true);
  
  // --- STATE ---
  const [classes, setClasses] = useState(initialSchedule);
  const [selectedClass, setSelectedClass] = useState<any>(initialSchedule[0]);
  
  // Gadget States (Focus Mode)
  const [gadgetOn, setGadgetOn] = useState(false);
  const [pluggedDay, setPluggedDay] = useState<number | null>(null);

  // Sticky Note
  const [showSticky, setShowSticky] = useState(true);
  const [stickyText, setStickyText] = useState("");

  // Chat States
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "System online. I have access to your schedule variables. How can I assist?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const constraintsRef = useRef(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const agendaRef = useRef<HTMLDivElement>(null);

  // --- 1. SYNC & DATA LOADING ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedClasses = localStorage.getItem('zaeon_schedule_data');
        const savedChat = localStorage.getItem('zaeon_chat_history');
        const savedSticky = localStorage.getItem('zaeon_sticky_note');
        
        if (savedClasses) setClasses(JSON.parse(savedClasses));
        if (savedChat) setChatHistory(JSON.parse(savedChat));
        if (savedSticky) setStickyText(savedSticky);
        
        setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => { 
      if (isDataLoaded) {
          localStorage.setItem('zaeon_schedule_data', JSON.stringify(classes)); 
          localStorage.setItem('zaeon_chat_history', JSON.stringify(chatHistory));
          localStorage.setItem('zaeon_sticky_note', stickyText);
      }
  }, [classes, chatHistory, stickyText, isDataLoaded]);

  // --- 2. REATIVIDADE DE DETALHES ---
  useEffect(() => {
    if (selectedClass) {
        const stillExists = classes.find(c => c.id === selectedClass.id);
        if (!stillExists) setSelectedClass(null);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatHistory]);

  // --- 3. LÓGICA DE PLUG (Drag & Drop) ---
  const handleGadgetDragEnd = (event: any, info: any) => {
    if (!agendaRef.current) return;
    
    const agendaRect = agendaRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    const isNearBottom = dropY > agendaRect.bottom - 80 && dropY < agendaRect.bottom + 50;
    const isInsideX = dropX > agendaRect.left && dropX < agendaRect.right;

    if (isNearBottom && isInsideX) {
        const relativeX = dropX - agendaRect.left;
        const colWidth = agendaRect.width / 5;
        const colIndex = Math.floor(relativeX / colWidth);
        
        if (colIndex >= 0 && colIndex <= 4) {
            setPluggedDay(colIndex);
            return;
        }
    }
    setPluggedDay(null);
  };

  const yearSquares = Array.from({ length: 365 }, (_, i) => Math.floor(Math.random() * 4));
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const hours = Array.from({ length: 9 }, (_, i) => i + 8);
  const formatTime = (h: number) => `${h.toString().padStart(2, '0')}:00 - ${(h + 2).toString().padStart(2, '0')}:00`;

  // --- 4. AGENT LOGIC (REAL API) ---
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      // Envia o estado atual das aulas como contexto para a IA
      const systemContext = JSON.stringify(classes);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          prompt: userMsg,       
          agent: "aura", // ou o nome do seu agente de agenda
          systemContext: systemContext 
        })
      });

      const data = await response.json();
      const aiResponse = data.text || "Connection error.";

      try {
        // Tenta detectar se a IA mandou um JSON de agenda nova
        // Geralmente limpamos o markdown ```json ... ```
        const cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        
        if (cleanResponse.startsWith('[') && cleanResponse.endsWith(']')) {
            const newSchedule = JSON.parse(cleanResponse);
            if (Array.isArray(newSchedule)) {
                setClasses(newSchedule); // ATUALIZA A AGENDA REALMENTE
                setChatHistory(prev => [...prev, { role: 'ai', text: "Schedule updated via Neural Link." }]);
            }
        } else {
            setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
        }
      } catch (e) {
        // Se falhar o parse, é só texto normal
        setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
      }

    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Error connecting to Zaeon Core." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div ref={constraintsRef} className="relative min-h-screen w-full flex flex-col items-center p-8 bg-transparent font-sans selection:bg-cyan-500/30">
      
      {/* HEADER / ANNUAL FLOW */}
      <section className="w-full max-w-[1400px] z-10 transition-all duration-700 pointer-events-auto">
        <div className="flex justify-between items-center px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Activity size={14} className="text-cyan-300" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">Annual Flow</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {!showSticky && (
                <button 
                    onClick={() => setShowSticky(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md transition-all"
                >
                    <StickyNote size={12} /> Open Note
                </button>
            )}
            <button
                onClick={() => setShowYearBoard(!showYearBoard)}
                className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full backdrop-blur-md"
            >
                {showYearBoard ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
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

      <div className="h-24 pointer-events-none"></div>

      {/* DRAGGABLE AREA */}
      <div className="flex justify-center items-start gap-8 flex-wrap z-20 relative w-full h-full">

        {/* 1. AGENT CHAT */}
        <motion.div
          drag
          dragConstraints={constraintsRef}
          whileHover={{ scale: 1.02, cursor: "grab" }}
          whileDrag={{ scale: 1.05, cursor: "grabbing", zIndex: 100 }}
          className="group w-72 h-[340px] relative z-10"
        >
            <div className="w-full h-full bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-[2.5rem] 
                            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_20px_40px_-10px_rgba(0,0,0,0.8)]
                            flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2 z-10">
                    <div className="flex items-center gap-2">
                        <Sparkles size={12} className="text-cyan-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">Assistant</span>
                    </div>
                    {isProcessing && <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>}
                </div>
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pr-1 py-2 z-10">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-2.5 rounded-2xl text-[10px] leading-relaxed font-medium 
                                ${msg.role === 'user' 
                                    ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20 rounded-br-sm' 
                                    : 'bg-white/5 text-white/80 border border-white/5 rounded-bl-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 flex gap-2 z-10">
                    <input 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isProcessing}
                        placeholder="Type command..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button onClick={handleSendMessage} disabled={isProcessing} className="p-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-xl border border-cyan-500/30 transition-colors disabled:opacity-50">
                        <Send size={12} />
                    </button>
                </div>
            </div>
        </motion.div>

        {/* 2. SCHEDULE (Com Sockets para o Gadget) */}
        <motion.div
          ref={agendaRef}
          drag
          dragConstraints={constraintsRef}
          whileHover={{ scale: 1.01, cursor: "grab" }}
          whileDrag={{ scale: 1.05, cursor: "grabbing", zIndex: 100 }}
          className="group w-64 h-[340px] relative z-10"
        >
          <div className={`w-full h-full backdrop-blur-xl border border-white/10 p-5 rounded-[2.5rem] 
                            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.6)]
                            flex flex-col items-center justify-between relative overflow-hidden transition-colors duration-500
                            bg-[#172554]/90 dark:bg-black/40`}>
            
            <div className="w-full flex justify-between items-center mb-2 pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Agenda</span>
              {pluggedDay !== null && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping shadow-[0_0_10px_#22d3ee]"></div>}
            </div>

            {/* COLUNAS */}
            <div className="w-full flex gap-2 justify-between h-full pointer-events-auto">
              {days.map((day, dIdx) => {
                const isPlugged = pluggedDay === dIdx;
                
                return (
                  <div key={day} className="flex flex-col h-full flex-1 items-center relative">
                    
                    {/* ZONA DE EFEITO (PULSE QUANDO PLUGADO) */}
                    <div className={`absolute inset-0 rounded-lg transition-all duration-500 pointer-events-none
                        ${isPlugged ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse' : ''}
                    `}/>

                    {/* SLOTS DE HORA */}
                    <div className="flex-1 flex flex-col justify-between w-full z-10 gap-[2px]">
                      {hours.map((hour) => {
                        const classAtTime = classes.find(c => c.days.includes(dIdx + 1) && c.hour === hour);
                        return (
                          <div
                            key={`${day}-${hour}`}
                            onPointerDown={() => classAtTime && setSelectedClass(classAtTime)}
                            className={`w-full flex-1 rounded-[2px] cursor-pointer transition-all duration-300 relative group/cell
                                ${classAtTime ? `bg-gradient-to-br ${classAtTime.color} opacity-80 hover:opacity-100` : 'bg-white/5 hover:bg-white/10'}
                            `}
                          />
                        );
                      })}
                    </div>

                    {/* RODAPÉ DA COLUNA (SOCKET + LABEL) */}
                    <div className="mt-2 w-full flex flex-col items-center justify-end h-8 relative">
                        {/* Se estiver plugado AQUI, renderiza o Gadget Encaixado */}
                        {isPlugged ? (
                            <motion.div 
                                layoutId="gadget-fuse"
                                onClick={() => setPluggedDay(null)} // Clique para desplugar
                                className="w-full h-6 bg-[#222] border-t-2 border-cyan-500 rounded-b-md shadow-[0_0_10px_#22d3ee] flex items-center justify-center cursor-pointer hover:bg-[#333]"
                            >
                                <div className={`w-2 h-2 rounded-full ${gadgetOn ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-gray-600'}`}></div>
                            </motion.div>
                        ) : (
                            // Socket Vazio
                            <div className="w-full h-1 bg-white/10 rounded-full mb-1"></div>
                        )}
                        <span className={`text-[7px] font-bold transition-colors ${isPlugged ? 'text-cyan-300' : 'text-white/40'}`}>
                            {day[0]}
                        </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 3. DETAILS */}
        <motion.div
          drag
          dragConstraints={constraintsRef}
          whileHover={{ scale: 1.05, cursor: "grab" }}
          whileDrag={{ scale: 1.1, cursor: "grabbing", zIndex: 100 }}
          className="group w-52 h-52 relative"
        >
          <div className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] 
                            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.6)]
                            flex flex-col justify-between relative overflow-hidden">
            {selectedClass ? (
                <>
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${selectedClass.color} rounded-full blur-[40px] opacity-40 animate-pulse pointer-events-none`}></div>
                    <div className="relative z-10 flex justify-between items-start pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full border border-white/5">
                        <MapPin size={10} className="text-white/80" />
                        <span className="text-[9px] font-bold text-white/90">{selectedClass.room}</span>
                    </div>
                    </div>
                    <div className="relative z-10 pointer-events-none mt-2">
                    <h2 className="text-sm font-bold text-white leading-tight drop-shadow-md mb-2">{selectedClass.name}</h2>
                    <div className="flex items-center gap-1.5 text-cyan-300">
                        <Clock size={12} />
                        <span className="text-[10px] font-mono font-medium tracking-wide">{formatTime(selectedClass.hour)}</span>
                    </div>
                    </div>
                    <div className="relative z-10 bg-white/5 border border-white/10 p-2 rounded-xl flex items-center gap-2 backdrop-blur-md pointer-events-none mt-auto">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-white/70 shrink-0">
                        <User size={10} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[7px] uppercase text-white/30 font-bold">Mentor</span>
                        <span className="text-[9px] font-medium text-white/90 truncate">{selectedClass.teacher}</span>
                    </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center"><X size={16} /></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">No Selection</span>
                </div>
            )}
          </div>
        </motion.div>

        {/* 4. GADGET "FUSION PLUG" (Flutuante) */}
        <AnimatePresence>
            {pluggedDay === null && (
                <motion.div
                    layoutId="gadget-fuse"
                    drag
                    onDragEnd={handleGadgetDragEnd}
                    dragConstraints={constraintsRef}
                    whileHover={{ scale: 1.05, cursor: "grab" }}
                    whileDrag={{ scale: 1.1, cursor: "grabbing", zIndex: 100 }}
                    className="group w-16 h-24 relative z-50"
                >
                    {/* CORPO DO CARTUCHO/FUSÍVEL */}
                    <div className="w-full h-full bg-gradient-to-b from-[#333] to-[#111] border border-gray-600 rounded-md 
                                    shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]
                                    flex flex-col items-center justify-between p-2 relative overflow-hidden">
                        
                        {/* Conector Dourado (Topo) */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-yellow-600 rounded-t-sm shadow-sm"></div>

                        {/* Parafusos */}
                        <div className="w-full flex justify-between px-1">
                            <div className="w-1 h-1 bg-gray-500 rounded-full shadow-inner"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full shadow-inner"></div>
                        </div>

                        {/* Botão Central */}
                        <button 
                            onPointerDown={(e) => { e.stopPropagation(); setGadgetOn(!gadgetOn); }}
                            className={`w-8 h-8 rounded-full border-2 border-[#444] shadow-[0_2px_5px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all
                            ${gadgetOn ? 'bg-cyan-900 shadow-[inset_0_0_8px_#06b6d4]' : 'bg-[#222]'}`}
                        >
                            <Power size={10} className={`transition-colors ${gadgetOn ? 'text-cyan-400' : 'text-gray-600'}`} />
                        </button>

                        {/* Visor de Status */}
                        <div className="w-full h-8 bg-black/60 rounded border border-white/5 flex items-center justify-center relative overflow-hidden">
                            {gadgetOn && (
                                <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
                            )}
                            <div className={`w-full h-[1px] bg-gray-700`}>
                                <motion.div 
                                    animate={{ width: gadgetOn ? "100%" : "0%" }} 
                                    className="h-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" 
                                />
                            </div>
                        </div>

                        <span className="text-[6px] font-mono text-gray-500 uppercase tracking-widest">FUSE-01</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 5. STICKY NOTE (Editável e Restaurável) */}
        <AnimatePresence>
          {showSticky && (
            <motion.div
              drag
              dragConstraints={constraintsRef}
              whileHover={{ scale: 1.05, cursor: "grab" }}
              whileDrag={{ scale: 1.1, cursor: "grabbing", zIndex: 90 }}
              className="group w-40 h-40 relative z-20"
            >
                <div className="absolute inset-0 bg-yellow-500/10 rounded-[2rem] blur-xl transition-opacity duration-700 pointer-events-none"></div>
                <div className="w-full h-full bg-yellow-900/10 backdrop-blur-xl border border-yellow-500/10 p-5 rounded-[2rem] 
                                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_15px_30px_-10px_rgba(0,0,0,0.5)]
                                flex flex-col justify-between relative overflow-hidden">
                    <button 
                        onClick={() => setShowSticky(false)}
                        className="absolute top-3 right-3 text-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-20"
                    >
                        <X size={14} />
                    </button>
                    <div className="flex items-center gap-2 text-yellow-500/80 mb-2">
                        <AlertCircle size={12} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Note</span>
                    </div>
                    <textarea 
                        value={stickyText}
                        onChange={(e) => setStickyText(e.target.value)}
                        className="w-full h-full bg-transparent border-none outline-none resize-none text-[10px] text-white/80 font-medium font-mono placeholder-white/20 leading-relaxed scrollbar-hide z-10"
                        placeholder="Write something..."
                        onPointerDown={(e) => e.stopPropagation()} 
                    />
                    <div className="h-0.5 w-12 bg-yellow-500/20 rounded-full mt-auto self-end pointer-events-none"></div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}