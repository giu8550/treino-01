"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evita erro de hidratação
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            // MUDANÇA AQUI: Usando 'foreground' em vez de 'white'
            // Isso garante que no modo claro (fundo branco), a borda fique escura
            className="p-2 rounded-lg border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all group shadow-sm"
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? (
                // Sol Amarelo no modo escuro
                <SunIcon className="w-6 h-6 text-yellow-300 group-hover:scale-110 transition-transform" />
            ) : (
                // Lua Roxa/Azul no modo claro
                <MoonIcon className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
            )}
        </button>
    );
}