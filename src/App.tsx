import { lazy, Suspense } from 'react';
import WelcomeBanner from './components/WelcomeBanner/WelcomeBanner';
import ScrollIndicator from './components/ScrollIndicator/ScrollIndicator';
import Sidebar from './components/Sidebar/Sidebar';
import Hero from './components/sections/Hero';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import MouseCube from './components/MouseCube/MouseCube';
import './App.css';

// Lazy load heavy components
const About = lazy(() => import('./components/sections/About'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Experience = lazy(() => import('./components/sections/Experience'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Contact = lazy(() => import('./components/sections/Contact'));

const sections = ['home', 'about', 'projects', 'experience', 'skills', 'contact'];

function App() {
  return (
    <div className="app">
      <LoadingScreen />
      <MouseCube />
      <WelcomeBanner />
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
