import { useEffect, useRef, useState } from 'react';
import './FPSMonitor.css';

const FPSMonitor = () => {
  const [fps, setFps] = useState(60);
  const [visible, setVisible] = useState(false);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'F') {
        setVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    let rafId: number;
    const updateFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      const averageDelta =
        frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const currentFps = Math.round(1000 / averageDelta);

      setFps(currentFps);

      rafId = requestAnimationFrame(updateFPS);
    };

    updateFPS();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!visible) return null;

  const fpsColor =
    fps >= 55 ? '#00ff88' : fps >= 40 ? '#ffaa00' : fps >= 25 ? '#ff6600' : '#ff0066';

  return (
    <div className="fps-monitor">
      <div className="fps-display" style={{ borderColor: fpsColor }}>
        <div className="fps-value" style={{ color: fpsColor }}>
          {fps}
        </div>
        <div className="fps-label">FPS</div>
      </div>
      <div className="fps-graph">
        {frameTimesRef.current.slice(-30).map((time, i) => {
          const height = Math.min((60 / (1000 / time)) * 100, 100);
          return (
            <div
              key={i}
              className="fps-bar"
              style={{
                height: `${height}%`,
                backgroundColor: fpsColor,
              }}
            />
          );
        })}
      </div>
      <div className="fps-hint">Press Shift+F to toggle</div>
    </div>
  );
};

export default FPSMonitor;
