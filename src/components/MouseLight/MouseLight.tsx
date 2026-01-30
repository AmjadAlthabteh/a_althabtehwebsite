import { useEffect, useState, useRef } from 'react';
import './MouseLight.css';

interface Trail {
  x: number;
  y: number;
  id: number;
  timestamp: number;
  hue: number;
  velocity: number;
}

const MouseLight = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState<Trail[]>([]);
  const [currentHue, setCurrentHue] = useState(0);
  const trailIdRef = useRef(0);
  const velocityRef = useRef({ vx: 0, vy: 0 });

  useEffect(() => {
    let rafId: number;
    let lastX = 0;
    let lastY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 16.67; // Normalize to 60fps
      lastTime = now;

      // Buttery smooth lerp with velocity tracking
      const smoothing = 0.12;
      const dx = targetX - lastX;
      const dy = targetY - lastY;

      lastX += dx * smoothing;
      lastY += dy * smoothing;

      velocityRef.current.vx = dx * dt;
      velocityRef.current.vy = dy * dt;

      setMousePosition({ x: lastX, y: lastY });

      // Add minimal trail effects based on velocity
      const speed = Math.sqrt(velocityRef.current.vx ** 2 + velocityRef.current.vy ** 2);

      // Update hue based on movement
      const hueShift = speed * 1.5;
      setCurrentHue(prev => (prev + hueShift) % 360);

      if (speed > 0.5) {
        setTrails(prev => {
          const newTrail = {
            x: lastX,
            y: lastY,
            id: trailIdRef.current++,
            timestamp: now,
            hue: (prev[prev.length - 1]?.hue || 0) + 8,
            velocity: speed
          };
          const filtered = prev.filter(t => now - t.timestamp < 800);
          return [...filtered, newTrail].slice(-8);
        });
      }

      // Clean up old trails
      setTrails(prev => prev.filter(t => now - t.timestamp < 800));

      rafId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const now = Date.now();
  const dynamicHue = currentHue % 360;

  return (
    <>
      {trails.map((trail) => {
        const age = now - trail.timestamp;
        const normalizedAge = Math.min(1, age / 800);
        const opacity = (1 - normalizedAge) * 0.3;
        const scale = 0.6 + (1 - normalizedAge) * 0.4;
        const hue = trail.hue % 360;

        return (
          <div
            key={trail.id}
            className="mouse-trail"
            style={{
              left: `${trail.x}px`,
              top: `${trail.y}px`,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              background: `radial-gradient(circle,
                hsla(${hue}, 80%, 60%, ${opacity}) 0%,
                hsla(${hue + 60}, 75%, 50%, ${opacity * 0.4}) 50%,
                transparent 80%)`,
              filter: `blur(${30 + trail.velocity * 15}px)`,
            }}
          />
        );
      })}
      <div
        className="mouse-light"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          background: `radial-gradient(circle,
            hsla(${dynamicHue}, 75%, 55%, 0.06) 0%,
            hsla(${dynamicHue + 60}, 70%, 50%, 0.03) 40%,
            transparent 70%)`,
        }}
      />
      <div
        className="mouse-light-glow"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          background: `radial-gradient(circle,
            hsla(${dynamicHue + 30}, 80%, 55%, 0.15) 0%,
            hsla(${dynamicHue + 90}, 75%, 50%, 0.1) 40%,
            transparent 70%)`,
          filter: `blur(50px)`,
        }}
      />
      <div
        className="mouse-light-core"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          background: `radial-gradient(circle,
            hsla(${dynamicHue + 180}, 85%, 65%, 0.2) 0%,
            hsla(${dynamicHue + 240}, 80%, 55%, 0.12) 40%,
            transparent 70%)`,
        }}
      />
      <div
        className="mouse-light-outer"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          background: `radial-gradient(circle,
            hsla(${dynamicHue - 60}, 75%, 50%, 0.05) 0%,
            hsla(${dynamicHue - 20}, 70%, 45%, 0.03) 50%,
            transparent 80%)`,
        }}
      />
    </>
  );
};

export default MouseLight;
