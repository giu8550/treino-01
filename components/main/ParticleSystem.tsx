"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// --- CONFIGURAÇÕES VISUAIS ---
const PARTICLE_COUNT = 2200; 
const GLOBE_RADIUS_RATIO = 0.35; 
const SNAKE_THICKNESS = 60; 
const SNAKE_SPEED = 0.01;   

const COLORS = [
  "#0ea5e9", "#22d3ee", "#3b82f6", "#2dd4bf", "#6366f1",
];

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  theta: number; 
  phi: number;   
  angle: number; 
  distance: number;
  // Propriedades da Barra Única
  barX: number;
  barY: number;
}

const ParticleSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = 0, height = 0;
    
    let particles: Particle[] = [];
    let animationId: number;
    let time = 0;

    // Fases: 0=Globo, 1=Serpente, 2=Geometria, 3=Barra Única, 4=Explosão
    let phase = 0; 
    let phaseTimer = 0;

    const applyDPR = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      particles = [];
      const phiFactor = Math.PI * (3 - Math.sqrt(5)); 
      
      const barCols = 100;
      const spacing = 10; 

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const y_pos = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
        
        const col = i % barCols;
        const row = Math.floor(i / barCols);

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          color: COLORS[i % COLORS.length],
          theta: phiFactor * i, 
          phi: Math.acos(y_pos),
          angle: (i / PARTICLE_COUNT) * Math.PI * 25,
          distance: Math.sqrt(i / PARTICLE_COUNT),
          barX: (col - barCols / 2) * spacing,
          barY: (row - 11) * spacing, 
        });
      }
    };

    const draw = () => {
      const isDark = resolvedTheme === "dark";
      // Ajuste leve na opacidade do rastro para ficar mais fluido
      ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.25)"; 
      ctx.fillRect(0, 0, width, height);

      phaseTimer++;

      if (phase === 0 && phaseTimer > 300) { phase = 1; phaseTimer = 0; }
      else if (phase === 1 && phaseTimer > 360) { phase = 2; phaseTimer = 0; }
      else if (phase === 2 && phaseTimer > 400) { phase = 3; phaseTimer = 0; } 
      else if (phase === 3 && phaseTimer > 450) { phase = 4; phaseTimer = 0; } 
      else if (phase === 4 && phaseTimer > 120) { phase = 0; phaseTimer = 0; }

      time += SNAKE_SPEED; 
      
      const centerX = width * 0.75; 
      const centerY = height * 0.5; 
      const screenCenterX = width * 0.5;
      const globeRadius = Math.min(width, height) * GLOBE_RADIUS_RATIO;

      particles.forEach((p, i) => {
        let targetX = p.x;
        let targetY = p.y;
        let scale = 1; 
        let isSquare = false;

        if (phase === 0) { 
          const rotation = time * 2;
          const sx = globeRadius * Math.sin(p.phi) * Math.cos(p.theta + rotation);
          const sz = globeRadius * Math.sin(p.phi) * Math.sin(p.theta + rotation);
          const sy = globeRadius * Math.cos(p.phi);
          const persp = 300 / (300 - sz);
          scale = Math.max(0.1, persp); 
          targetX = centerX + sx;
          targetY = centerY + sy;
        } 
        else if (phase === 1) { 
          const t = time * 2 - (i * 0.002);
          const wx = Math.cos(t) * (width * 0.4) + Math.sin(t * 2.1) * (width * 0.1);
          const wy = Math.sin(t * 1.3) * (height * 0.4) + Math.cos(t * 1.7) * (height * 0.1);
          targetX = screenCenterX + wx + Math.cos(i) * SNAKE_THICKNESS;
          targetY = (height * 0.5) + wy + Math.sin(i) * SNAKE_THICKNESS;
        } 
        else if (phase === 2) { 
          const shapeShift = Math.sin(phaseTimer * 0.03); 
          const spiralX = Math.cos(p.angle + time) * p.distance * globeRadius * 1.8;
          const spiralY = Math.sin(p.angle + time) * p.distance * globeRadius * 1.8;
          const k = 5, l = 0.5, geoR = globeRadius * 1.3;
          const geoX = geoR * ((1-k)*Math.cos(p.angle) + l*k*Math.cos((1-k)/k * p.angle));
          const geoY = geoR * ((1-k)*Math.sin(p.angle) - l*k*Math.sin((1-k)/k * p.angle));
          const lerp = (shapeShift + 1) / 2;
          targetX = centerX + (spiralX * (1 - lerp) + geoX * lerp);
          targetY = centerY + (spiralY * (1 - lerp) + geoY * lerp);
        }
        else if (phase === 3) { 
          isSquare = true;
          targetX = screenCenterX + p.barX;
          targetY = (height * 0.5) + p.barY;
          const colIndex = i % 100;
          const pulse = Math.sin(time * 8 + colIndex * 0.1);
          scale = 0.8 + pulse * 0.4;
        }
        else if (phase === 4) { 
           const dx = p.x - screenCenterX;
           const dy = p.y - (height * 0.5);
           const angle = Math.atan2(dy, dx);
           targetX = p.x + Math.cos(angle) * 15;
           targetY = p.y + Math.sin(angle) * 15;
        }

        const ease = phase === 4 ? 1 : 0.08;
        p.x += (targetX - p.x) * ease;
        p.y += (targetY - p.y) * ease;

        ctx.beginPath();
        let alpha = phase === 0 ? (scale > 1 ? 1 : 0.3) : 0.8;

        if (isSquare) {
          const s = 8 * scale;
          ctx.shadowBlur = isDark ? 15 : 5; 
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = isDark ? alpha * 0.5 : alpha * 0.8;
          ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = alpha;
          ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.globalAlpha = 1; 
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(draw);
    };

    applyDPR();
    initParticles();
    draw();

    const onResize = () => { applyDPR(); initParticles(); };
    window.addEventListener("resize", onResize);

    return () => { 
      cancelAnimationFrame(animationId); 
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, resolvedTheme]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 bg-white dark:bg-black pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default ParticleSystem;