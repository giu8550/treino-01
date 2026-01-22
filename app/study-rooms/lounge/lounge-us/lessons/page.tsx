"use client";

export default function LessonsModule() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="h-40 rounded-3xl bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[#0f172a] dark:text-white text-xs font-bold uppercase">
                Class: Intro to AI
            </div>
            <div className="h-40 rounded-3xl bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[#0f172a] dark:text-white text-xs font-bold uppercase">
                Class: Web Development
            </div>
        </div>
    );
}