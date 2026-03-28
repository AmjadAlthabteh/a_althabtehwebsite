import { useEffect, useRef } from "react";
import { useMousePosition } from "../../hooks/useMousePosition";
import "./ParticleField.css";

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition(16); // Throttle to ~60fps
  const mouseHueRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
      life: number;
      maxLife: number;
      hue: number;
      saturation: number;
      history: { x: number; y: number }[];

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 4 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.fadeSpeed = Math.random() * 0.01 + 0.005;
        this.maxLife = Math.random() * 500 + 300;
        this.life = 0;
        this.hue = Math.random() * 60 + 220; // Blue to purple range
        this.saturation = Math.random() * 30 + 70;
        this.history = [];
      }

      update(mouseX: number, mouseY: number) {
        // Store minimal history for trails (reduced to 4 for maximum performance)
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 4) {
          this.history.shift();
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        // Enhanced mouse interaction with cached calculations
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distanceSq = dx * dx + dy * dy; // Avoid sqrt when possible
        const interactionRadius = 400;
        const interactionRadiusSq = interactionRadius * interactionRadius;

        if (distanceSq < interactionRadiusSq) {
          const distance = Math.sqrt(distanceSq);
          const angle = Math.atan2(dy, dx);
          const force = (interactionRadius - distance) / interactionRadius;

          // Swirling vortex motion
          const perpAngle = angle + Math.PI / 2;
          const repelForce = force * 8;
          const swirl = force * 5;

          this.x -= Math.cos(angle) * repelForce;
          this.y -= Math.sin(angle) * repelForce;
          this.x += Math.cos(perpAngle) * swirl;
          this.y += Math.sin(perpAngle) * swirl;

          // Visual enhancement near mouse
          this.opacity = Math.min(1, this.opacity + force * 0.6);
          this.hue = (this.hue + force * 5) % 360;
          this.size = Math.min(8, this.size + force * 2);
        } else {
          this.size = Math.max(1.5, this.size - 0.08);
        }

        // Smoother fade in and out
        if (this.life < 60) {
          this.opacity = Math.min(this.opacity, (this.life / 60) * 0.8);
        } else if (this.life > this.maxLife - 60) {
          this.opacity = Math.max(0, ((this.maxLife - this.life) / 60) * 0.8);
        }

        // Wrap around
        if (this.x < 0) this.x = canvas!.width;
        if (this.x > canvas!.width) this.x = 0;
        if (this.y < 0) this.y = canvas!.height;
        if (this.y > canvas!.height) this.y = 0;
      }

      draw(ctx: CanvasRenderingContext2D, mouseX: number, mouseY: number, mouseHue: number) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distanceSq = dx * dx + dy * dy;
        const nearMouse = distanceSq < 160000; // 400 * 400

        // Dynamic hue based on position and mouse
        const distance = nearMouse ? Math.sqrt(distanceSq) : 0;
        const baseHue = nearMouse ? mouseHue : this.hue;
        const colorShift = nearMouse ? ((400 - distance) / 400) * 120 : 0;

        // Draw trailing effect with rainbow colors
        if (this.history.length > 1) {
          ctx.lineCap = "round";
          ctx.lineWidth = this.size * 0.6;

          for (let i = 0; i < this.history.length - 1; i++) {
            const alpha = (i / this.history.length) * this.opacity * 0.5;
            const trailHue = (baseHue + i * 10) % 360;
            ctx.strokeStyle = `hsla(${trailHue}, 100%, 70%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(this.history[i].x, this.history[i].y);
            ctx.lineTo(this.history[i + 1].x, this.history[i + 1].y);
            ctx.stroke();
          }
        }

        // Core particle with vibrant rainbow glow
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size * 4,
        );

        const hue1 = (baseHue + colorShift) % 360;
        const hue2 = (baseHue + colorShift + 60) % 360;
        const hue3 = (baseHue + colorShift + 120) % 360;

        gradient.addColorStop(0, `hsla(${hue1}, 100%, 80%, ${this.opacity})`);
        gradient.addColorStop(
          0.3,
          `hsla(${hue2}, 100%, 70%, ${this.opacity * 0.8})`,
        );
        gradient.addColorStop(
          0.6,
          `hsla(${hue3}, 90%, 60%, ${this.opacity * 0.5})`,
        );
        gradient.addColorStop(1, `hsla(${hue3}, 90%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Ultra-bright white core
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Simplified outer ring - only one ring, only when near mouse
        if (nearMouse) {
          ctx.strokeStyle = `hsla(${hue1}, 100%, 70%, ${this.opacity * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      isDead() {
        return this.life >= this.maxLife;
      }
    }

    let particles: Particle[] = [];
    const maxParticles = 15; // Reduced for better performance

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const connectParticles = (mouseX: number, mouseY: number, mouseHue: number) => {
      const connectionDistance = 80; // Reduced for better performance
      const connectionDistanceSq = connectionDistance * connectionDistance;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < connectionDistanceSq) {
            const distance = Math.sqrt(distanceSq);
            const opacity = (1 - distance / connectionDistance) * 0.4;

            // Check proximity to mouse for enhanced connection glow (use squared distance)
            const mouseDistISq = (mouseX - particles[i].x) ** 2 + (mouseY - particles[i].y) ** 2;
            const mouseDistJSq = (mouseX - particles[j].x) ** 2 + (mouseY - particles[j].y) ** 2;
            const minMouseDistSq = Math.min(mouseDistISq, mouseDistJSq);
            const mouseEnhancement = minMouseDistSq < 122500 ? Math.max(0, 1 - Math.sqrt(minMouseDistSq) / 350) : 0;

            const finalOpacity = opacity + mouseEnhancement * 0.6;

            // Rainbow connections based on mouse hue
            const hue1 = (mouseHue + distance * 0.5) % 360;
            const hue2 = (mouseHue + distance * 0.5 + 60) % 360;
            const hue3 = (mouseHue + distance * 0.5 + 120) % 360;

            const gradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y,
            );
            gradient.addColorStop(
              0,
              `hsla(${hue1}, 100%, 70%, ${finalOpacity})`,
            );
            gradient.addColorStop(
              0.5,
              `hsla(${hue2}, 100%, 65%, ${finalOpacity * 0.8})`,
            );
            gradient.addColorStop(
              1,
              `hsla(${hue3}, 100%, 60%, ${finalOpacity * 0.6})`,
            );

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1 + mouseEnhancement * 3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      // Update mouse hue based on movement speed
      const dx = mousePosition.x - lastMousePosRef.current.x;
      const dy = mousePosition.y - lastMousePosRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      mouseHueRef.current = (mouseHueRef.current + speed * 0.5) % 360;
      lastMousePosRef.current = { x: mousePosition.x, y: mousePosition.y };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Remove dead particles and add new ones
      particles = particles.filter((p) => !p.isDead());
      while (particles.length < maxParticles) {
        particles.push(new Particle());
      }

      const mouseX = mousePosition.x;
      const mouseY = mousePosition.y;
      const mouseHue = mouseHueRef.current;

      particles.forEach((particle) => {
        particle.update(mouseX, mouseY);
        particle.draw(ctx, mouseX, mouseY, mouseHue);
      });

      connectParticles(mouseX, mouseY, mouseHue);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [mousePosition]);

  return <canvas ref={canvasRef} className="particle-field" />;
};

export default ParticleField;
