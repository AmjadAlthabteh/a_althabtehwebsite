import { lazy, Suspense } from 'react';
import MouseLight from './components/MouseLight/MouseLight';
import GradientMesh from './components/GradientMesh/GradientMesh';
import ParticleField from './components/ParticleField/ParticleField';
import ColorReveal from './components/ColorReveal/ColorReveal';
import WelcomeBanner from './components/WelcomeBanner/WelcomeBanner';
import ScrollIndicator from './components/ScrollIndicator/ScrollIndicator';
import Sidebar from './components/Sidebar/Sidebar';
import Hero from './components/sections/Hero';
import './App.css';

// Lazy load heavy components
const RotatingCube = lazy(() => import('./components/RotatingCube/RotatingCube'));
const About = lazy(() => import('./components/sections/About'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Experience = lazy(() => import('./components/sections/Experience'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Contact = lazy(() => import('./components/sections/Contact'));

const sections = ['home', 'about', 'projects', 'experience', 'skills', 'contact'];

function App() {
  return (
    <div className="app">
      <WelcomeBanner />
      <GradientMesh />
      <ParticleField />
      <ColorReveal />
      <MouseLight />
      <Suspense fallback={<div style={{ display: 'none' }} />}>
        <RotatingCube />
      </Suspense>
      <Sidebar />
      <ScrollIndicator sections={sections} />

      <main className="main-content">
        <Hero />
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <About />
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
