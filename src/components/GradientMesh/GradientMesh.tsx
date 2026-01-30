import { useEffect, useRef } from 'react';
import './GradientMesh.css';

const GradientMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    class GradientBlob {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      baseRadius: number;
      color: string;
      speedX: number;
      speedY: number;
      angle: number;
      angleSpeed: number;

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.radius = radius;
        this.baseRadius = radius;
        this.color = color;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.03;
      }

      update() {
        this.angle += this.angleSpeed;
        this.baseX += Math.cos(this.angle) * 0.8 + this.speedX;
        this.baseY += Math.sin(this.angle) * 0.8 + this.speedY;

        // Mouse interaction - attract blobs to mouse
        const dx = mouseX - this.baseX;
        const dy = mouseY - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 500) {
          const force = (500 - distance) / 500;
          this.x = this.baseX + dx * force * 0.3;
          this.y = this.baseY + dy * force * 0.3;
          this.radius = this.baseRadius * (1 + force * 0.5);
        } else {
          this.x = this.baseX;
          this.y = this.baseY;
          this.radius = this.baseRadius;
        }

        if (this.baseX < -this.baseRadius) this.baseX = canvas!.width + this.baseRadius;
        if (this.baseX > canvas!.width + this.baseRadius) this.baseX = -this.baseRadius;
        if (this.baseY < -this.baseRadius) this.baseY = canvas!.height + this.baseRadius;
        if (this.baseY > canvas!.height + this.baseRadius) this.baseY = -this.baseRadius;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const blobs = [
      new GradientBlob(canvas.width * 0.2, canvas.height * 0.3, 400, 'hsla(260, 70%, 50%, 0.08)'),
      new GradientBlob(canvas.width * 0.8, canvas.height * 0.7, 350, 'hsla(290, 70%, 45%, 0.08)'),
      new GradientBlob(canvas.width * 0.5, canvas.height * 0.5, 380, 'hsla(330, 70%, 50%, 0.07)'),
      new GradientBlob(canvas.width * 0.7, canvas.height * 0.2, 360, 'hsla(180, 70%, 45%, 0.07)'),
    ];

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply blur for blending
      ctx.filter = 'blur(80px)';

      blobs.forEach(blob => {
        blob.update();
        blob.draw(ctx);
      });

      ctx.filter = 'none';

      // Draw subtle mouse glow
      const mouseHue = (time * 30) % 360;
      const mouseGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 200);
      mouseGradient.addColorStop(0, `hsla(${mouseHue}, 75%, 55%, 0.08)`);
      mouseGradient.addColorStop(0.5, `hsla(${mouseHue + 60}, 70%, 50%, 0.04)`);
      mouseGradient.addColorStop(1, `hsla(${mouseHue + 120}, 70%, 45%, 0)`);

      ctx.filter = 'blur(50px)';
      ctx.fillStyle = mouseGradient;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 200, 0, Math.PI * 2);
      ctx.fill();

      ctx.filter = 'none';

      time += 0.01;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="gradient-mesh" />;
};

export default GradientMesh;
