import { useEffect, useState } from 'react';
import './WelcomeBanner.css';

const WelcomeBanner = () => {
  const [hide, setHide] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation - faster
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 30);

    // Hide banner after animation - shorter duration
    const timer = setTimeout(() => {
      setHide(true);
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className={`welcome-banner ${hide ? 'hide' : ''}`}>
      {/* Animated background shapes */}
      <div className="welcome-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {/* Particle grid */}
      <div className="particle-grid">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="particle" style={{ '--i': i } as React.CSSProperties}></div>
        ))}
      </div>

      <div className="welcome-content">
        {/* Logo symbol with enhanced design */}
        <div className="logo-symbol">
          <div className="symbol-ring ring-1"></div>
          <div className="symbol-ring ring-2"></div>
          <div className="symbol-ring ring-3"></div>
          <div className="symbol-ring ring-4"></div>
          <div className="symbol-core"></div>
          {/* Energy burst lines */}
          <div className="energy-lines">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="energy-line" style={{ '--angle': `${i * 30}deg` } as React.CSSProperties}></div>
            ))}
          </div>
        </div>

        {/* Sleek progress bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-glow" style={{ left: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
