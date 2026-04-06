import { useEffect, useState } from 'react';
import './KonamiCode.css';

const KonamiCode = () => {
  const [activated, setActivated] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA',
    ];

    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          setActivated(true);
          setShowMessage(true);
          konamiIndex = 0;

          setTimeout(() => {
            setShowMessage(false);
          }, 5000);

          setTimeout(() => {
            setActivated(false);
          }, 10000);
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {activated && (
        <div className="konami-overlay">
          <div className="konami-stars">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="konami-star"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          <div className="konami-rainbow" />
        </div>
      )}

      {showMessage && (
        <div className="konami-message">
          <div className="konami-message-content">
            <h2>🎮 KONAMI CODE ACTIVATED! 🎮</h2>
            <p>You found the secret! You're awesome!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default KonamiCode;
