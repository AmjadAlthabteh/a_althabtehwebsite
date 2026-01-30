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
      <div className="welcome-background-effect" />
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome</h1>
        <p className="welcome-subtitle">Experience Interactive Design</p>
        <p className="welcome-message">Move your mouse and explore</p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
