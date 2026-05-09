import { motion } from "framer-motion";
import "./GalaxyHero.css";

// Cinematic Space Hero - C++ Graphics Engineer Portfolio
const GalaxyHero = () => {
  return (
    <section id="home" className="galaxy-hero">
      {/* Multi-layer background */}
      <div className="space-background">
        {/* Deep space gradient base */}
        <div className="deep-space-layer"></div>

        {/* Nebula fog layers */}
        <div className="nebula-layer nebula-1"></div>
        <div className="nebula-layer nebula-2"></div>
        <div className="nebula-layer nebula-3"></div>

        {/* Starfield - simple stars */}
        <div className="starfield starfield-1">
          {[...Array(80)].map((_, i) => (
            <div
              key={`star-1-${i}`}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.6 + 0.4
              }}
            />
          ))}
        </div>

        <div className="starfield starfield-2">
          {[...Array(30)].map((_, i) => (
            <div
              key={`star-2-${i}`}
              className="star star-medium"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="starfield starfield-3">
          {[...Array(15)].map((_, i) => (
            <div
              key={`star-3-${i}`}
              className="star star-large"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Floating particles - cosmic dust */}
        <div className="particle-field">
          {[...Array(20)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${20 + Math.random() * 15}s`
              }}
            />
          ))}
        </div>

        {/* Grid overlay - subtle holographic effect */}
        <div className="grid-overlay"></div>

        {/* Airplane flying through space */}
        <div className="space-airplane">
          <div className="airplane-body">
            <div className="airplane-nose"></div>
            <div className="airplane-fuselage"></div>
            <div className="airplane-wing"></div>
            <div className="airplane-tail"></div>
            <div className="airplane-engine"></div>
            <div className="airplane-trail"></div>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="galaxy-hero-content">
        <motion.div
          className="hero-text-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Text glow backdrop */}
          <div className="text-glow-backdrop"></div>

          <motion.h1
            className="galaxy-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Amjad <span className="highlight-text">Althabteh</span>
          </motion.h1>

          <motion.p
            className="galaxy-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <span className="accent-text">C++ Graphics Engineer</span> building high-performance rendering systems, GPU pipelines, and low-level optimization for real-time graphics
          </motion.p>

          <motion.p
            className="galaxy-hero-role"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            Rendering Systems <span className="role-separator">•</span> GPU Architecture <span className="role-separator">•</span> Graphics Programming
          </motion.p>

          <motion.div
            className="galaxy-hero-social"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <a
              href="https://github.com/AmjadAlthabteh"
              target="_blank"
              rel="noopener noreferrer"
              className="galaxy-social-link"
              aria-label="GitHub"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/amjad-althabteh/"
              target="_blank"
              rel="noopener noreferrer"
              className="galaxy-social-link"
              aria-label="LinkedIn"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </motion.div>

          <motion.div
            className="galaxy-hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <a
              href="#projects"
              className="galaxy-btn galaxy-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="btn-glow"></div>
              <span className="btn-text">View Projects</span>
            </a>
            <a
              href="/assets/AmjadSAlthabtehResume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="galaxy-btn galaxy-btn-outline"
            >
              <div className="btn-glow"></div>
              <span className="btn-text">Resume</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <div className="scroll-line"></div>
        <span className="scroll-text">Scroll Down</span>
      </motion.div>
    </section>
  );
};

export default GalaxyHero;
