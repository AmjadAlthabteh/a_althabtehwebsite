import { lazy, Suspense } from 'react';
import WelcomeBanner from './components/WelcomeBanner/WelcomeBanner';
import ScrollIndicator from './components/ScrollIndicator/ScrollIndicator';
import Sidebar from './components/Sidebar/Sidebar';
import GalaxyHero from './components/sections/GalaxyHero';
import FloatingShapes from './components/FloatingShapes/FloatingShapes';
import RoboticCursor from './components/RoboticCursor/RoboticCursor';
import ClickExplosion from './components/ClickExplosion/ClickExplosion';
import KonamiCode from './components/KonamiCode/KonamiCode';
import FPSMonitor from './components/FPSMonitor/FPSMonitor';
import KeyboardNav from './components/KeyboardNav/KeyboardNav';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';
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
  return (
    <div className="app">
      <FloatingShapes />
      <RoboticCursor />
      <ClickExplosion />
      <KonamiCode />
      <FPSMonitor />
      <KeyboardNav />
      <ScrollProgress />
      <WelcomeBanner />
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
  );
}

export default App;
