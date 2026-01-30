import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <h1 className="hero-title">
            Hey, I'm <span className="highlight">Amjad.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <h2 className="hero-subtitle">
            Software Engineer • Game Developer • Systems Programmer
          </h2>
        </motion.div>

        <motion.p
          className="hero-mission"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          I build performant systems, real-time visuals, and immersive interactive experiences.
        </motion.p>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.9,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <a href="#projects" className="btn btn-primary">
            View Projects
          </a>
          <a
            href="https://github.com/AmjadAlthabteh"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            GitHub
          </a>
          <a href="/assets/AmjadSAlthabtehResume.pdf" download className="btn btn-outline">
            Resume
          </a>
        </motion.div>
      </div>

      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </section>
  );
};

export default Hero;
