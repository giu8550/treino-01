"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

type Column = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  alpha: number;
};

type Star = {
  x: number;
  y: number;
  r: number;
  alpha: number;
};

const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const isDark =
      (theme === "system" ? resolvedTheme : theme) === "dark";

    const baseBg = isDark ? "#030014" : "#f8fafc";

    const columns: Column[] = [];
    const stars: Star[] = [];

    const COLUMN_COUNT = isDark ? 60 : 40;
    const STAR_COUNT = isDark ? 140 : 90;

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min);
    }

    function applyDPR() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      width = canvas.clientWidth;
      height = canvas.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createColumns() {
      columns.length = 0;

      for (let i = 0; i < COLUMN_COUNT; i++) {
        columns.push({
          x: rand(0, width),
          y: rand(-height, height),
          width: rand(1, 3),
          height: rand(height * 0.3, height * 0.9),
          speed: rand(0.2, 0.7),
          alpha: rand(0.05, 0.2),
        });
      }
    }

    function createStars() {
      stars.length = 0;

      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: rand(0, width),
          y: rand(0, height),
          r: rand(0.5, 1.5),
          alpha: rand(0.05, 0.2),
        });
      }
    }

    function drawColumns() {
      ctx.save();

      ctx.globalCompositeOperation = "screen";

      for (const col of columns) {
        const gradient = ctx.createLinearGradient(
          col.x,
          col.y,
          col.x,
          col.y + col.height
        );

        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(
          0.5,
          `rgba(80,200,255,${col.alpha})`
        );
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;

        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(80,200,255,0.6)";

        ctx.fillRect(col.x, col.y, col.width, col.height);
      }

      ctx.restore();
    }

    function drawStars() {
      ctx.save();

      ctx.globalCompositeOperation = "screen";

      for (const s of stars) {
        ctx.globalAlpha = s.alpha;

        ctx.fillStyle = "rgba(180,240,255,1)";

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawVignette() {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        width
      );

      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.45)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    let animationId: number;

    function animate() {
      ctx.fillStyle = baseBg;
      ctx.fillRect(0, 0, width, height);

      drawColumns();
      drawStars();
      drawVignette();

      for (const col of columns) {
        col.y += col.speed;

        if (col.y > height) {
          col.y = -col.height;
          col.x = rand(0, width);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    applyDPR();
    createColumns();
    createStars();

    animate();

    const resize = () => {
      applyDPR();
      createColumns();
      createStars();
    };

    const observer = new ResizeObserver(resize);

    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [mounted, theme, resolvedTheme]);

  if (!mounted)
    return <div className="fixed inset-0 bg-[#030014]" />;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default CyberBackground;
export const StarsCanvas = CyberBackground;