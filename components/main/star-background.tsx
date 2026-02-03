"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// ==========================================
// CONFIGURAÇÃO: MATRIX & CORES
// ==========================================
const WORDS = ["幸运", "信仰", "努力", "教育", "组织", "荣誉", "社区", "胜利", "梦想"];
const FONT_FAMILY = `"Noto Sans SC", "Microsoft YaHei", "SimHei", monospace, sans-serif`;

// PALETAS (Garantindo consistência entre Matrix e Partículas)
const MATRIX_DARK_PALETTE = ["#9ecbff", "#5fb4ff", "#2b8eff", "#1a73e8", "#1572a1", "#00a7a7", "#009688", "#33cccc", "#7dd3fc"];
// Removi o preto puro para evitar o problema visual no modo claro, usando azuis muito escuros
const MATRIX_LIGHT_PALETTE = ["#0f172a", "#1e293b", "#334155", "#0369a1", "#1d4ed8", "#475569"];

// ==========================================
// CONFIGURAÇÃO: GEOMETRIA
// ==========================================
const PARTICLE_COUNT = 2200; 
const GLOBE_RADIUS_RATIO = 0.35; 
const SNAKE_THICKNESS = 60; 
const SNAKE_SPEED = 0.01;   

// DURAÇÃO DA MATRIX EM FRAMES (12 segundos * 60 fps = 720)
const MATRIX_DURATION = 720; 

function buildStreamSource() {
    const chunks: string[] = [];
    for (let i = 0; i < WORDS.length; i++) {
        chunks.push(WORDS[i]);
        if (i % 3 === 1) chunks.push("₿");
        if (i % 5 === 2) chunks.push("Ξ");
        if (i % 7 === 3) chunks.push("ICP");
    }
    return chunks.join("");
}
const STREAM_SOURCE = buildStreamSource();

// ==========================================
// TIPAGEM
// ==========================================
type MatrixCol = { 
  y: number; 
  speed: number; 
  color: string; 
  offset: number 
};

interface Particle {
  x: number;
  y: number;
  size: number;
  colorSeed: number; 
  
  // Física da Explosão
  vx: number; 
  vy: number;

  // Alvos
  targetX: number;
  targetY: number;

  // Props 3D
  theta: number; 
  phi: number;   
  
  // Props Geométricas
  angle: number; 
  distance: number;
  barX: number;
  barY: number;
}

const FinalHybridSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!; // Voltamos ao contexto padrão para suportar sombras e arcs suaves
    let width = 0, height = 0;
    
    // STATES
    let globalPhase = 0; 
    let phaseTimer = 0;
    let time = 0;
    let animationId: number;

    // DADOS
    let matrixCols: MatrixCol[] = [];
    let particles: Particle[] = [];
    
    const fontSize = 13;
    const fadeLengthLines = 50;

    const applyDPR = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // --- INIT MATRIX ---
    const initMatrix = () => {
      const colWidthBase = Math.round((fontSize * 4) / 0.4);
      const columns = Math.max(2, Math.floor(width / colWidthBase));
      const activePalette = (resolvedTheme === 'dark') ? MATRIX_DARK_PALETTE : MATRIX_LIGHT_PALETTE;

      matrixCols = new Array(columns).fill(0).map((_, i) => ({
        y: -Math.random() * 50,
        speed: 0.40 + (i % 5) * (0.30 / 5),
        color: activePalette[(i + Math.floor(Math.random() * 3)) % activePalette.length],
        offset: Math.floor(Math.random() * STREAM_SOURCE.length),
      }));
    };

    // --- INIT PARTICLES ---
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
          x: width / 2, 
          y: height / 2,
          size: Math.random() * 2 + 1, // Tamanho original variado
          colorSeed: i, 
          vx: 0, 
          vy: 0,
          targetX: 0, 
          targetY: 0,
          theta: phiFactor * i, 
          phi: Math.acos(y_pos),
          angle: (i / PARTICLE_COUNT) * Math.PI * 25,
          distance: Math.sqrt(i / PARTICLE_COUNT),
          barX: (col - barCols / 2) * spacing,
          barY: (row - 11) * spacing,
        });
      }
    };

    // --- HARVEST MATRIX ---
    const morphMatrixToParticles = () => {
      let pIndex = 0;
      for (let c = 0; c < matrixCols.length; c++) {
        const col = matrixCols[c];
        const headY = col.y * fontSize;
        const colX = matrixCols.length > 1 
            ? (c * (width - fontSize)) / (matrixCols.length - 1) 
            : (width - fontSize) / 2;

        const pointsPerCol = Math.floor(PARTICLE_COUNT / matrixCols.length); 
        
        for (let j = 0; j < pointsPerCol; j++) {
           if (pIndex >= particles.length) break;
           const offsetY = Math.random() * (fadeLengthLines * fontSize);
           const y = headY - offsetY;
           
           if (y > -50 && y < height + 50) {
             particles[pIndex].x = colX + fontSize/2; 
             particles[pIndex].y = y;
           } else {
             particles[pIndex].x = Math.random() * width;
             particles[pIndex].y = Math.random() * height;
           }
           // Reset física
           particles[pIndex].vx = 0;
           particles[pIndex].vy = 0;
           pIndex++;
        }
      }
    };

    // --- MAIN DRAW LOOP ---
    const draw = () => {
      const isDark = resolvedTheme === 'dark';
      
      // Fundo com rastro
      const fadeAlpha = globalPhase === 0 ? 0.22 : 0.3; // Um pouco mais limpo nas partículas
      const bgColor = isDark 
         ? `rgba(3, 0, 20, ${fadeAlpha})` 
         : `rgba(255, 255, 255, ${fadeAlpha})`;
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      phaseTimer++;
      time += SNAKE_SPEED;

      // 1. MATRIX (12 Segundos)
      if (globalPhase === 0) {
        if (phaseTimer > MATRIX_DURATION) {
            morphMatrixToParticles(); 
            globalPhase = 1; 
            phaseTimer = 0;
        }
        drawMatrixLogic(isDark);
      }
      
      // 2. TRANSIÇÃO
      else if (globalPhase === 1) {
        if (phaseTimer > 80) { globalPhase = 2; phaseTimer = 0; }
        calculateParticleTargets(2); // Vai para o Globo
        drawParticlesLogic(isDark, true); 
      }

      // 3. PARTÍCULAS (Sequência)
      else if (globalPhase === 2) {
         let localPhase = 0; // Globo
         let localTimer = phaseTimer;
         
         // Tempos ajustados para fluidez
         if (phaseTimer > 300) { localPhase = 1; localTimer = phaseTimer - 300; } // Snake
         if (phaseTimer > 660) { localPhase = 2; localTimer = phaseTimer - 660; } // Geo
         if (phaseTimer > 1020) { localPhase = 3; localTimer = phaseTimer - 1020; } // Bar
         if (phaseTimer > 1420) { globalPhase = 3; phaseTimer = 0; } // Inicia Explosão

         calculateParticleTargets(localPhase, localTimer);
         drawParticlesLogic(isDark, false);
      }

      // 4. EXPLOSÃO (Limpeza)
      else if (globalPhase === 3) {
         if (phaseTimer > 90) { // Tempo para as partículas saírem da tela
            initMatrix(); 
            globalPhase = 0; 
            phaseTimer = 0;
         }
         calculateExplosionTargets(); 
         drawParticlesLogic(isDark, false);
      }

      animationId = requestAnimationFrame(draw);
    };

    const drawMatrixLogic = (isDark: boolean) => {
        const activePalette = isDark ? MATRIX_DARK_PALETTE : MATRIX_LIGHT_PALETTE;
        ctx.font = `${fontSize}px ${FONT_FAMILY}`;
        ctx.textBaseline = "top";
        const BASE_ALPHA = 0.90;
        
        for (let i = 0; i < matrixCols.length; i++) {
            const col = matrixCols[i];
            const x = matrixCols.length > 1
                ? (i * (width - fontSize)) / (matrixCols.length - 1)
                : (width - fontSize) / 2;
            const headY = col.y * fontSize;

            if (Math.random() < 0.01) {
                 col.color = activePalette[(i + Math.floor(Math.random() * 3)) % activePalette.length];
            }
            ctx.fillStyle = col.color;

            for (let j = 0; j < fadeLengthLines; j++) {
                const y = headY - j * fontSize;
                if (y < -fontSize) break;
                if (y > height + fontSize) continue;

                const t = j / (fadeLengthLines - 1);
                const alpha = BASE_ALPHA * (1 - t);
                if (alpha <= 0) continue;

                ctx.globalAlpha = alpha;
                const charIndex = (col.offset + Math.floor(col.y) - j + STREAM_SOURCE.length * 100) % STREAM_SOURCE.length;
                const ch = STREAM_SOURCE.charAt(Math.floor(charIndex));
                ctx.fillText(ch, x, y);
            }
            col.y += col.speed;
            if (headY > height + fadeLengthLines * fontSize) {
                col.y = -Math.random() * 40;
                col.offset = (col.offset + Math.floor(5 + Math.random() * 25)) % STREAM_SOURCE.length;
            }
        }
        ctx.globalAlpha = 1;
    };

    const calculateParticleTargets = (subPhase: number, localTime: number = 0) => {
        const centerX = width * 0.75; 
        const centerY = height * 0.5; 
        const screenCenterX = width * 0.5;
        const globeRadius = Math.min(width, height) * GLOBE_RADIUS_RATIO;
        const rot = time * 2;

        for (let i = 0; i < particles.length; i++) {
             const p = particles[i];
             if (subPhase === 0 || globalPhase === 1) { // GLOBO 3D
                const sx = globeRadius * Math.sin(p.phi) * Math.cos(p.theta + rot);
                const sy = globeRadius * Math.cos(p.phi);
                p.targetX = centerX + sx;
                p.targetY = centerY + sy;
             } 
             else if (subPhase === 1) { // SNAKE
                const t = time * 2 - (i * 0.002);
                const wx = Math.cos(t) * (width * 0.4) + Math.sin(t * 2.1) * (width * 0.1);
                const wy = Math.sin(t * 1.3) * (height * 0.4) + Math.cos(t * 1.7) * (height * 0.1);
                p.targetX = screenCenterX + wx + Math.cos(i) * SNAKE_THICKNESS;
                p.targetY = (height * 0.5) + wy + Math.sin(i) * SNAKE_THICKNESS;
             }
             else if (subPhase === 2) { // GEOMETRY
                const shapeShift = Math.sin(localTime * 0.03); 
                const spiralX = Math.cos(p.angle + time) * p.distance * globeRadius * 1.8;
                const spiralY = Math.sin(p.angle + time) * p.distance * globeRadius * 1.8;
                const k = 5, l = 0.5, geoR = globeRadius * 1.3;
                const geoX = geoR * ((1-k)*Math.cos(p.angle) + l*k*Math.cos((1-k)/k * p.angle));
                const geoY = geoR * ((1-k)*Math.sin(p.angle) - l*k*Math.sin((1-k)/k * p.angle));
                const lerp = (shapeShift + 1) / 2;
                p.targetX = centerX + (spiralX * (1 - lerp) + geoX * lerp);
                p.targetY = centerY + (spiralY * (1 - lerp) + geoY * lerp);
             }
             else if (subPhase === 3) { // BAR
                p.targetX = screenCenterX + p.barX;
                p.targetY = (height * 0.5) + p.barY;
             }
        }
    };

    const calculateExplosionTargets = () => {
        const cx = width * 0.5;
        const cy = height * 0.5;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.vx === 0 && p.vy === 0) {
                const angle = Math.atan2(p.y - cy, p.x - cx);
                const force = 10 + Math.random() * 20; // Força inicial
                p.vx = Math.cos(angle) * force;
                p.vy = Math.sin(angle) * force;
            }
            p.vx *= 1.08; // Aceleração
            p.vy *= 1.08;
            p.targetX = p.x + p.vx;
            p.targetY = p.y + p.vy;
        }
    };

    const drawParticlesLogic = (isDark: boolean, transitioning: boolean) => {
        const activePalette = isDark ? MATRIX_DARK_PALETTE : MATRIX_LIGHT_PALETTE;
        const globeRadius = Math.min(width, height) * GLOBE_RADIUS_RATIO;
        const rot = time * 2;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // 1. MOVIMENTO (Lógica diferente para explosão)
            if (globalPhase === 3) {
                p.x = p.targetX;
                p.y = p.targetY;
            } else {
                const ease = transitioning ? 0.05 : 0.08;
                p.x += (p.targetX - p.x) * ease;
                p.y += (p.targetY - p.y) * ease;
            }

            // 2. CÁLCULO DE ESCALA 3D (Efeito Original)
            // Calculamos o Z para alterar o tamanho da bolinha no Globo
            let scale = 1;
            if (globalPhase === 2 && phaseTimer < 300) { // Apenas na sub-fase do Globo
                const z = globeRadius * Math.sin(p.phi) * Math.sin(p.theta + rot);
                const perspective = 300 / (300 - z);
                scale = Math.max(0.2, perspective);
            } else if (globalPhase === 3) { // Na explosão, diminui até sumir
                scale = Math.max(0, 1 - (phaseTimer/90)); 
            }

            // 3. DESENHO (Círculos "Originais")
            ctx.beginPath();
            const color = activePalette[p.colorSeed % activePalette.length];
            ctx.fillStyle = color;
            
            // Alpha control
            let alpha = 1;
            if (globalPhase === 3) alpha = 1 - (phaseTimer / 80); // Fade out na explosão
            else if (transitioning) alpha = phaseTimer / 100; // Fade in na transição
            else if (globalPhase === 2 && phaseTimer < 300) alpha = scale > 1 ? 1 : 0.4; // Profundidade no globo

            if (alpha <= 0) continue;

            ctx.globalAlpha = alpha;
            // Desenhando como CÍRCULOS (arc) como no original
            ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    };

    applyDPR();
    initMatrix();
    initParticles(); 
    draw();

    const onResize = () => { applyDPR(); initMatrix(); initParticles(); };
    window.addEventListener("resize", onResize);

    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", onResize); };
  }, [mounted, resolvedTheme]);

  if (!mounted) return <div className="fixed inset-0 z-0 bg-black" />;

  return (
    <div className="fixed inset-0 z-0 transition-colors duration-700 bg-white dark:bg-black pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default FinalHybridSystem;