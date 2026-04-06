import { useEffect, useRef, useState } from 'react';
import './ClickExplosion.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const ClickExplosion = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const handleClick = (e: MouseEvent) => {
      const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff6600', '#ff0066'];
      const newParticles: Particle[] = [];

      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 2 + Math.random() * 4;
        newParticles.push({
          id: particleIdRef.current++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    };

    window.addEventListener('click', handleClick);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles((prev) => {
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0);
      });

      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [particles]);

  return <canvas ref={canvasRef} className="click-explosion" />;
};

export default ClickExplosion;
