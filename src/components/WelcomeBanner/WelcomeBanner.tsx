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
      {/* Stars background */}
      <div className="stars-layer">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="star" style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--delay': `${Math.random() * 3}s`,
            '--duration': `${2 + Math.random() * 2}s`
          } as React.CSSProperties}></div>
        ))}
      </div>

      <div className="welcome-content">
        {/* Target Planet */}
        <div className="planet">
          <div className="planet-surface">
            <div className="crater crater-1"></div>
            <div className="crater crater-2"></div>
            <div className="crater crater-3"></div>
          </div>
          <div className="planet-atmosphere"></div>
          <div className="planet-shadow"></div>
        </div>

        {/* Spaceship */}
        <div className="spaceship">
          <div className="ship-body">
            <div className="ship-cockpit"></div>
            <div className="ship-wing ship-wing-left"></div>
            <div className="ship-wing ship-wing-right"></div>
            <div className="ship-engine">
              <div className="engine-flame"></div>
              <div className="engine-glow"></div>
            </div>
          </div>
          <div className="ship-trail"></div>
        </div>

        {/* Impact effect */}
        <div className="impact-ring"></div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-glow" style={{ left: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
