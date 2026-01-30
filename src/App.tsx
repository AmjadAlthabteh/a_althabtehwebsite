import MouseLight from './components/MouseLight/MouseLight';
import RotatingCube from './components/RotatingCube/RotatingCube';
import GradientMesh from './components/GradientMesh/GradientMesh';
import ParticleField from './components/ParticleField/ParticleField';
import ColorReveal from './components/ColorReveal/ColorReveal';
import WelcomeBanner from './components/WelcomeBanner/WelcomeBanner';
import ScrollIndicator from './components/ScrollIndicator/ScrollIndicator';
import Sidebar from './components/Sidebar/Sidebar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Skills from './components/sections/Skills';
import Contact from './components/sections/Contact';
import './App.css';

const sections = ['home', 'about', 'projects', 'experience', 'skills', 'contact'];

function App() {
  return (
    <div className="app">
      <WelcomeBanner />
      <GradientMesh />
      <ParticleField />
      <ColorReveal />
      <MouseLight />
      <RotatingCube />
      <Sidebar />
      <ScrollIndicator sections={sections} />

      <main className="main-content">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
    </div>
  );
}

export default App;
