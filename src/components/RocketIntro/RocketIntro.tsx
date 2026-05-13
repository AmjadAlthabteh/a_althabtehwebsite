import { useState, useEffect } from 'react';
import './RocketIntro.css';

interface RocketIntroProps {
  onComplete: () => void;
}

const RocketIntro: React.FC<RocketIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'launch' | 'space' | 'landing' | 'landed' | 'complete'>('launch');

  useEffect(() => {
    const timeline = [
      { phase: 'launch', duration: 2000 },
      { phase: 'space', duration: 2500 },
      { phase: 'landing', duration: 2000 },
      { phase: 'landed', duration: 1500 },
      { phase: 'complete', duration: 500 }
    ];

    let currentIndex = 0;

    const advancePhase = () => {
      if (currentIndex < timeline.length - 1) {
        currentIndex++;
        setPhase(timeline[currentIndex].phase as any);
        setTimeout(advancePhase, timeline[currentIndex].duration);
      } else {
        onComplete();
      }
    };

    setTimeout(advancePhase, timeline[0].duration);
  }, [onComplete]);

  return (
    <div className={`rocket-intro ${phase}`}>
      {/* Stars background */}
      <div className="stars-background">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* Launch pad - visible during launch phase */}
      {phase === 'launch' && (
        <div className="launch-pad">
          <div className="ground"></div>
          <div className="tower-left"></div>
          <div className="tower-right"></div>
        </div>
      )}

      {/* Rocket */}
      <div className={`rocket ${phase}`}>
        <div className="rocket-body">
          <div className="rocket-nose"></div>
          <div className="rocket-main"></div>
          <div className="rocket-fin rocket-fin-left"></div>
          <div className="rocket-fin rocket-fin-right"></div>
          <div className="rocket-window"></div>
        </div>
        <div className="rocket-flames">
          <div className="flame flame-1"></div>
          <div className="flame flame-2"></div>
          <div className="flame flame-3"></div>
        </div>
        <div className="smoke-trail"></div>
      </div>

      {/* Planet - appears during landing phase */}
      {(phase === 'landing' || phase === 'landed' || phase === 'complete') && (
        <div className={`planet ${phase}`}>
          <div className="planet-surface">
            <div className="planet-glow"></div>
            <div className="crater crater-1"></div>
            <div className="crater crater-2"></div>
            <div className="crater crater-3"></div>
            <div className="planet-text">PLANET RELASTICS</div>
          </div>
        </div>
      )}

      {/* Welcome text - appears after landing */}
      {(phase === 'landed' || phase === 'complete') && (
        <div className="welcome-text">
          <h1>Welcome In</h1>
          <div className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RocketIntro;
