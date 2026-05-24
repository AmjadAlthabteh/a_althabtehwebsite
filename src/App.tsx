import { lazy, Suspense, useState } from 'react';
import RocketIntro from './components/RocketIntro/RocketIntro';
import ScrollIndicator from './components/ScrollIndicator/ScrollIndicator';
import Sidebar from './components/Sidebar/Sidebar';
import GalaxyHero from './components/sections/GalaxyHero';
import KeyboardNav from './components/KeyboardNav/KeyboardNav';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import './App.css';

// Lazy load heavy components
const About = lazy(() => import('./components/sections/About'));
const Stats = lazy(() => import('./components/sections/Stats'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Experience = lazy(() => import('./components/sections/Experience'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Contact = lazy(() => import('./components/sections/Contact'));

const sections = ['home', 'about', 'projects', 'experience', 'skills', 'contact'];

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setTimeout(() => setFadeIn(true), 50);
  };

  return (
    <>
      {showIntro && <RocketIntro onComplete={handleIntroComplete} />}
      <div className={`app ${fadeIn ? 'fade-in' : ''}`}>
        <ThemeToggle />
        <KeyboardNav />
        <ScrollProgress />
        <Sidebar />
        <ScrollIndicator sections={sections} />

        <main className="main-content">
          <GalaxyHero />
          <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
            <About />
            <Stats />
            <Projects />
            <Experience />
            <Skills />
            <Contact />
          </Suspense>
        </main>
      </div>
    </>
  );
}

export default App;
