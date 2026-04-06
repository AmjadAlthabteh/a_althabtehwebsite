import { useEffect, useState } from 'react';
import './RoboticCursor.css';

const RoboticCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let rafId: number;
    let targetPosition = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetPosition = { x: e.clientX, y: e.clientY };
      setIsMoving(true);

      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsMoving(false);
      }, 150);

      // Throttle updates using requestAnimationFrame
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          setPosition(targetPosition);
          rafId = 0;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className={`robotic-cursor ${isMoving ? 'moving' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="cursor-crosshair">
        <div className="crosshair-line horizontal"></div>
        <div className="crosshair-line vertical"></div>
      </div>
      <div className="cursor-corner corner-tl"></div>
      <div className="cursor-corner corner-tr"></div>
      <div className="cursor-corner corner-bl"></div>
      <div className="cursor-corner corner-br"></div>
      <div className="cursor-dot"></div>
    </div>
  );
};

export default RoboticCursor;
