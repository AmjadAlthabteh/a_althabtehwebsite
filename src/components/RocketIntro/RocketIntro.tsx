import { useState, useEffect } from 'react';
import './RocketIntro.css';

interface RocketIntroProps {
  onComplete: () => void;
}

type Phase = 'launch' | 'space' | 'landing' | 'landed' | 'complete';

const RocketIntro: React.FC<RocketIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('launch');

  useEffect(() => {
    const timeline: Array<{ phase: Exclude<Phase, 'complete'>; duration: number }> = [
      { phase: 'launch', duration: 2000 },
      { phase: 'space', duration: 2500 },
      { phase: 'landing', duration: 2000 },
      { phase: 'landed', duration: 1500 }
    ];

    let currentIndex = 0;
    let timeoutId: number | undefined;

    const advancePhase = () => {
      if (currentIndex < timeline.length - 1) {
        currentIndex++;
        setPhase(timeline[currentIndex].phase);
        timeoutId = window.setTimeout(advancePhase, timeline[currentIndex].duration);
      } else {
        setPhase('complete');
        timeoutId = window.setTimeout(onComplete, 900);
      }
    };

    timeoutId = window.setTimeout(advancePhase, timeline[0].duration);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
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
        <div className="rocket-welcome">
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
