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
  onComplete?: () => void;
}

export default function HyperText({
  text,
  delay = 0,
  duration = 0.7, // Velocidade de digitação assertiva
  className,
  onComplete,
}: HyperTextProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState<string[]>(text.split("").map(() => ""));

  useEffect(() => {
    const startTimeout = setTimeout(() => setIsAnimating(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isAnimating) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text.split("").map((letter, i) => {
          if (i < iteration) return text[i];
          if (letter === " ") return " ";
          return CYPHERS[Math.floor(Math.random() * CYPHERS.length)];
        })
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
      iteration += duration;
    }, 40); // 40ms é o "ponto doce" para parecer digitação fluida

    return () => clearInterval(interval);
  }, [isAnimating, text, duration, onComplete]);

  return (
    <div className={cn("flex flex-wrap justify-center items-center gap-[0.8em]", className)}>
      {displayText.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }} // Surgimento seco como uma tecla
          className="inline-block text-inherit"
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}