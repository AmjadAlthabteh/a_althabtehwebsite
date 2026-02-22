import { useEffect, useState } from 'react';
import './WelcomeBanner.css';

const WelcomeBanner = () => {
  const [hide, setHide] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // Hide banner after animation
    const timer = setTimeout(() => {
      setHide(true);
    }, 3500);

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
        {/* Logo symbol */}
        <div className="logo-symbol">
          <div className="symbol-ring ring-1"></div>
          <div className="symbol-ring ring-2"></div>
          <div className="symbol-ring ring-3"></div>
          <div className="symbol-core"></div>
        </div>

        {/* Loading text */}
        <div className="loading-text">
          <span className="load-letter" style={{ '--delay': '0.1s' } as React.CSSProperties}>l</span>
          <span className="load-letter" style={{ '--delay': '0.2s' } as React.CSSProperties}>o</span>
          <span className="load-letter" style={{ '--delay': '0.3s' } as React.CSSProperties}>a</span>
          <span className="load-letter" style={{ '--delay': '0.4s' } as React.CSSProperties}>d</span>
          <span className="load-letter" style={{ '--delay': '0.5s' } as React.CSSProperties}>i</span>
          <span className="load-letter" style={{ '--delay': '0.6s' } as React.CSSProperties}>n</span>
          <span className="load-letter" style={{ '--delay': '0.7s' } as React.CSSProperties}>g</span>
          <span className="load-dots">
            <span style={{ '--delay': '0.8s' } as React.CSSProperties}>.</span>
            <span style={{ '--delay': '0.9s' } as React.CSSProperties}>.</span>
            <span style={{ '--delay': '1.0s' } as React.CSSProperties}>.</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-glow" style={{ left: `${progress}%` }}></div>
        </div>

        {/* Progress percentage */}
        <div className="progress-text">{progress}%</div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
