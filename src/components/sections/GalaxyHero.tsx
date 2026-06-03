import { motion } from "framer-motion";
import { useMemo } from "react";
import type { CSSProperties } from "react";
import "./GalaxyHero.css";

// Cinematic Space Hero - C++ Graphics Engineer Portfolio
const GalaxyHero = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 120 }).map((_, i) => {
        const sizeRoll = Math.random();
        const sizeClass = sizeRoll > 0.92 ? "star-large" : sizeRoll > 0.75 ? "star-medium" : "";
        return {
          key: `star-${i}`,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 3.2 + Math.random() * 3.8,
          opacity: 0.35 + Math.random() * 0.65,
          sizeClass
        };
      }),
    []
  );

  const shootingStars = useMemo(
    () => [
      { top: "18%", left: "88%", delay: "0.2s", duration: "4.2s" },
      { top: "36%", left: "72%", delay: "3.8s", duration: "3.8s" },
      { top: "64%", left: "42%", delay: "6.4s", duration: "4.6s" },
      { top: "24%", left: "56%", delay: "9.1s", duration: "4.0s" },
      { top: "52%", left: "94%", delay: "11.8s", duration: "3.7s" }
    ],
    []
  );

  const spacecraft = useMemo(
    () => [
      { top: "26%", delay: "1.6s", duration: "26s", scale: 0.9, variant: "craft-a" },
      { top: "58%", delay: "7.2s", duration: "32s", scale: 0.75, variant: "craft-b" },
      { top: "40%", delay: "14.5s", duration: "28s", scale: 0.82, variant: "craft-c" },
      { top: "70%", delay: "4.8s", duration: "30s", scale: 0.85, variant: "craft-a" },
      { top: "18%", delay: "11.2s", duration: "27s", scale: 0.78, variant: "craft-b" }
    ],
    []
  );

  const robots = useMemo(
    () => [
      { top: "32%", delay: "2.5s", duration: "24s", scale: 0.85, variant: "robot-a" },
      { top: "65%", delay: "9.8s", duration: "28s", scale: 0.75, variant: "robot-b" },
      { top: "15%", delay: "16.2s", duration: "26s", scale: 0.8, variant: "robot-c" },
      { top: "48%", delay: "6.0s", duration: "30s", scale: 0.9, variant: "robot-a" }
    ],
    []
  );

  return (
    <section id="home" className="galaxy-hero">
      {/* Multi-layer background */}
      <div className="space-background">
        {/* Deep space gradient base */}
        <div className="deep-space-layer"></div>

        {/* Depth layers for 3D feel */}
        <div className="space-depth-layer depth-far"></div>
        <div className="space-depth-layer depth-mid"></div>

        {/* Starfield */}
        <div className="starfield starfield-1">
          {stars.map((s) => (
            <div
              key={s.key}
              className={`star ${s.sizeClass}`}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`
              }}
            />
          ))}
        </div>

        {/* Shooting stars */}
        {shootingStars.map((s, idx) => (
          <div
            key={`shooting-star-${idx}`}
            className="shooting-star"
            style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.duration }}
          ></div>
        ))}

        {/* Subtle background traffic */}
        {spacecraft.map((c, idx) => (
          <div
            key={`spacecraft-${idx}`}
            className={`spacecraft ${c.variant}`}
            style={
              {
                top: c.top,
                animationDelay: c.delay,
                animationDuration: c.duration,
                ["--craft-scale" as any]: c.scale
              } satisfies CSSProperties
            }
            aria-hidden="true"
          >
            <svg viewBox="0 0 120 40" role="presentation" focusable="false">
              <path className="spacecraft-trail" d="M6 22 C24 20, 42 20, 58 20" />
              <path className="spacecraft-hull" d="M64 20 L80 14 L104 20 L80 26 Z" />
              <path className="spacecraft-hull" d="M80 14 L86 9 L92 14" />
              <circle className="spacecraft-core" cx="76" cy="20" r="2.4" />
            </svg>
          </div>
        ))}

        {/* Moving robots */}
        {robots.map((r, idx) => (
          <div
            key={`robot-${idx}`}
            className={`robot ${r.variant}`}
            style={
              {
                top: r.top,
                animationDelay: r.delay,
                animationDuration: r.duration,
                ["--robot-scale" as any]: r.scale
              } satisfies CSSProperties
            }
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 60" role="presentation" focusable="false">
              {/* Robot body */}
              <rect className="robot-body" x="35" y="20" width="30" height="28" rx="4" />
              {/* Robot head */}
              <rect className="robot-head" x="40" y="10" width="20" height="14" rx="3" />
              {/* Robot eyes */}
              <circle className="robot-eye" cx="46" cy="16" r="2" />
              <circle className="robot-eye" cx="54" cy="16" r="2" />
              {/* Robot antenna */}
              <line className="robot-antenna" x1="50" y1="10" x2="50" y2="4" />
              <circle className="robot-antenna-tip" cx="50" cy="4" r="2" />
              {/* Robot arms */}
              <rect className="robot-arm" x="28" y="26" width="7" height="16" rx="2" />
              <rect className="robot-arm" x="65" y="26" width="7" height="16" rx="2" />
              {/* Robot legs */}
              <rect className="robot-leg" x="40" y="48" width="8" height="10" rx="2" />
              <rect className="robot-leg" x="52" y="48" width="8" height="10" rx="2" />
              {/* Jetpack trail */}
              <path className="robot-trail" d="M30 34 C20 34, 10 34, 0 34" />
              <path className="robot-trail" d="M30 38 C20 38, 10 38, 0 38" />
            </svg>
          </div>
        ))}
      </div>

      {/* Main planetary orbit system */}
      <div className="orbit-system">
        <div className="orbit orbit-1">
          <div className="planet planet-1"></div>
        </div>
        <div className="orbit orbit-2">
          <div className="planet planet-2"></div>
        </div>
        <div className="orbit orbit-3">
          <div className="planet planet-3"></div>
        </div>
      </div>

      {/* Additional background planets */}
      <div className="planet planet-4"></div>
      <div className="planet planet-5"></div>
      <div className="planet planet-6"></div>
      <div className="planet planet-7"></div>
      <div className="planet planet-8"></div>
      <div className="planet planet-9"></div>

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
          <div className="hero-hud-frame" aria-hidden="true"></div>

          <motion.div
            className="galaxy-hero-welcome"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <span className="welcome-rocket">🚀</span>
            <span className="welcome-text">welcome</span>
          </motion.div>

          <motion.h1
            className="galaxy-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <span className="name-first">Amjad</span>
            <br />
            <span className="highlight-text">Althabteh</span>
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
            Rendering Systems <span className="role-separator">//</span> GPU Architecture <span className="role-separator">//</span> Real-Time Systems
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
    </section>
  );
};

export default GalaxyHero;
