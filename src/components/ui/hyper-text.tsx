"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CYPHERS = "电脳世界技术未来革新";

interface HyperTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function HyperText({
  text,
  delay = 0,
  duration = 0.6, // Ritmo de digitação restaurado
  className,
}: HyperTextProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsAnimating(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const words = text.split(" ");

  return (
    <div className={cn("flex flex-wrap justify-center items-center gap-[1.2rem]", className)}>
      {words.map((word, wordIndex) => (
        <Word 
          key={wordIndex} 
          word={word} 
          isAnimating={isAnimating} 
          duration={duration} 
        />
      ))}
    </div>
  );
}

function Word({ word, isAnimating, duration }: { word: string, isAnimating: boolean, duration: number }) {
  const [displayWord, setDisplayWord] = useState(word.split("").map(() => ""));
  
  useEffect(() => {
    if (!isAnimating) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayWord(
        word.split("").map((letter, i) => {
          if (i < iteration) return word[i];
          return CYPHERS[Math.floor(Math.random() * CYPHERS.length)];
        })
      );

      if (iteration >= word.length) clearInterval(interval);
      iteration += duration; // Incremento rítmico
    }, 45); // Cadência de 45ms (o "ponto doce" da digitação)

    return () => clearInterval(interval);
  }, [isAnimating, word, duration]);

  return (
    <span className="flex flex-nowrap whitespace-nowrap">
      {displayWord.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }} // Aparecimento mais seco, como uma tecla
          className={cn(
            "inline-block",
            char !== word[i] ? "text-slate-300" : "text-inherit"
          )}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}