import { useEffect, useState } from 'react';
import './WelcomeBanner.css';

const WelcomeBanner = () => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`welcome-banner ${hide ? 'hide' : ''}`}>
      <div className="welcome-content">
        <h1 className="welcome-title">
          <span className="glitch" data-text="welcome">welcome</span>
        </h1>
        <p className="welcome-subtitle">amjad althabteh</p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
