import { useEffect, useRef } from 'react';
import './ParticleField.css';

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;
    let mouseHue = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      mouseX = e.clientX;
      mouseY = e.clientY;

      // Change color based on movement
      mouseHue = (mouseHue + speed * 0.5) % 360;

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };

    window.addEventListener('mousemove', handleMouseMove);

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

      update() {
        // Store history for trails
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 20) {
          this.history.shift();
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        // DRAMATICALLY enhanced mouse interaction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 400) {
          const angle = Math.atan2(dy, dx);
          const force = (400 - distance) / 400;

          // Intense swirling vortex motion
          const perpAngle = angle + Math.PI / 2;
          const repelForce = force * 8;
          const swirl = force * 5;

          this.x -= Math.cos(angle) * repelForce;
          this.y -= Math.sin(angle) * repelForce;
          this.x += Math.cos(perpAngle) * swirl;
          this.y += Math.sin(perpAngle) * swirl;

          // Dramatic visual enhancement near mouse
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

      draw(ctx: CanvasRenderingContext2D) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nearMouse = distance < 400;

        // Dynamic hue based on position and mouse
        const baseHue = nearMouse ? mouseHue : this.hue;
        const colorShift = nearMouse ? (400 - distance) / 400 * 120 : 0;

        // Draw trailing effect with rainbow colors
        if (this.history.length > 1) {
          ctx.lineCap = 'round';
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
          this.x, this.y, 0,
          this.x, this.y, this.size * 4
        );

        const hue1 = (baseHue + colorShift) % 360;
        const hue2 = (baseHue + colorShift + 60) % 360;
        const hue3 = (baseHue + colorShift + 120) % 360;

        gradient.addColorStop(0, `hsla(${hue1}, 100%, 80%, ${this.opacity})`);
        gradient.addColorStop(0.3, `hsla(${hue2}, 100%, 70%, ${this.opacity * 0.8})`);
        gradient.addColorStop(0.6, `hsla(${hue3}, 90%, 60%, ${this.opacity * 0.5})`);
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

        // Colorful outer rings
        ctx.strokeStyle = `hsla(${hue1}, 100%, 70%, ${this.opacity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.stroke();

        if (nearMouse) {
          ctx.strokeStyle = `hsla(${hue2}, 100%, 60%, ${this.opacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      isDead() {
        return this.life >= this.maxLife;
      }
    }

    let particles: Particle[] = [];
    const maxParticles = 60;

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.4;

            // Check proximity to mouse for enhanced connection glow
            const mouseDistI = Math.sqrt((mouseX - particles[i].x) ** 2 + (mouseY - particles[i].y) ** 2);
            const mouseDistJ = Math.sqrt((mouseX - particles[j].x) ** 2 + (mouseY - particles[j].y) ** 2);
            const mouseEnhancement = Math.max(0, 1 - Math.min(mouseDistI, mouseDistJ) / 350);

            const finalOpacity = opacity + mouseEnhancement * 0.6;

            // Rainbow connections based on mouse hue
            const hue1 = (mouseHue + distance * 0.5) % 360;
            const hue2 = (mouseHue + distance * 0.5 + 60) % 360;
            const hue3 = (mouseHue + distance * 0.5 + 120) % 360;

            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, `hsla(${hue1}, 100%, 70%, ${finalOpacity})`);
            gradient.addColorStop(0.5, `hsla(${hue2}, 100%, 65%, ${finalOpacity * 0.8})`);
            gradient.addColorStop(1, `hsla(${hue3}, 100%, 60%, ${finalOpacity * 0.6})`);

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Remove dead particles and add new ones
      particles = particles.filter(p => !p.isDead());
      while (particles.length < maxParticles) {
        particles.push(new Particle());
      }

      particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      connectParticles();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" />;
};

export default ParticleField;
