import { useEffect, useMemo, useState } from 'react';
import './RocketIntro.css';

interface RocketIntroProps {
  onRevealStart?: () => void;
  onComplete: () => void;
}

type LaunchPhase = 'countdown' | 'ignition' | 'takeoff' | 'reveal';

const starSeeds = Array.from({ length: 92 }, (_, index) => ({
  id: index,
  left: (index * 37) % 101,
  top: (index * 61) % 100,
  size: 1 + (index % 3),
  delay: (index % 8) * 0.25,
}));

const RocketIntro: React.FC<RocketIntroProps> = ({ onRevealStart, onComplete }) => {
  const [phase, setPhase] = useState<LaunchPhase>('countdown');
  const [count, setCount] = useState(3);

  const telemetry = useMemo(
    () => ['GUIDANCE ONLINE', 'MAIN ENGINE START', 'VECTOR LOCK', 'SITE HANDOFF'],
    []
  );

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setCount(2), 850),
      window.setTimeout(() => setCount(1), 1700),
      window.setTimeout(() => setPhase('ignition'), 2550),
      window.setTimeout(() => setPhase('takeoff'), 3250),
      window.setTimeout(() => {
        setPhase('reveal');
        onRevealStart?.();
      }, 4650),
      window.setTimeout(onComplete, 5450),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [onComplete, onRevealStart]);

  return (
    <section className={`rocket-intro rocket-intro--${phase}`} aria-label="Rocket launch intro">
      <div className="rocket-intro__stars" aria-hidden="true">
        {starSeeds.map((star) => (
          <span
            key={star.id}
            className="rocket-intro__star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="rocket-intro__hud" aria-hidden="true">
        {telemetry.map((item, index) => (
          <span key={item} style={{ animationDelay: `${index * 0.22}s` }}>
            {item}
          </span>
        ))}
      </div>

      <div className="rocket-intro__flight-lines" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="rocket-intro__countdown" aria-live="polite">
        {phase === 'countdown' ? (
          <>
            <span key={count} className="rocket-intro__count">{count}</span>
            <span className="rocket-intro__caption">Launch sequence</span>
          </>
        ) : (
          <>
            <span className="rocket-intro__takeoff">TAKEOFF</span>
            <span className="rocket-intro__caption">Loading mission control</span>
          </>
        )}
      </div>

      <div className="rocket-intro__scene" aria-hidden="true">
        <div className="rocket-intro__destination">
          <span className="rocket-intro__planet" />
          <span className="rocket-intro__moon" />
          <span className="rocket-intro__orbit" />
        </div>

        <div className="rocket-intro__gantry">
          <span />
          <span />
          <span />
        </div>

        <div className="rocket-intro__rocket">
          <div className="rocket-intro__nose" />
          <div className="rocket-intro__body">
            <div className="rocket-intro__window" />
            <div className="rocket-intro__stripe" />
          </div>
          <div className="rocket-intro__fin rocket-intro__fin--left" />
          <div className="rocket-intro__fin rocket-intro__fin--right" />
          <div className="rocket-intro__engine" />
          <div className="rocket-intro__flame" />
          <div className="rocket-intro__flame rocket-intro__flame--core" />
        </div>

        <div className="rocket-intro__heat" />
        <div className="rocket-intro__plume">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="rocket-intro__shockwave" />
        <div className="rocket-intro__pad" />
      </div>

      <div className="rocket-intro__handoff" aria-hidden="true">
        <span className="rocket-intro__horizon" />
        <span className="rocket-intro__portal" />
      </div>
    </section>
  );
};

export default RocketIntro;
