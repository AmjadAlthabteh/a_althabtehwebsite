import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Experience.css';

interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
  tech?: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: 1,
    role: 'SWE Intern',
    company: 'Immersalab Graphics',
    location: 'Detroit, MI',
    period: 'Sep 2025',
    highlights: [
      'Architected real-time rendering engine in C++20 and OpenGL with GPU-driven rendering',
      'Built internal UI and asset-authoring tools using JSON-driven pipelines',
      'Implemented data-driven rendering optimizations with AI-guided heuristics',
      'Designed modular rendering subsystems with clear ownership boundaries',
      'Added GPU-side profiling and frame-timing instrumentation',
    ],
    tech: ['Unreal', 'C++'],
  },
  {
    id: 2,
    role: 'Indie Game Developer',
    company: 'AAA Game Project',
    location: 'Ann Arbor, MI',
    period: 'Apr 2025 - Aug 2025',
    highlights: [
      'Developed gameplay systems using C++20 and Visual Scripting',
      'Created 3D environments and characters, rigging for animation',
      'Produced 90+ second real-time cinematic using MetaHumans and Sequencer',
      'Built dynamic animation-control layer with Animation Blueprints',
      'Implemented event-driven state transitions for gameplay and cinematic sync',
    ],
  },
  {
    id: 3,
    role: 'Software Development Intern',
    company: 'Rare Munchies',
    location: 'Ann Arbor, MI',
    period: 'Sep 2023 - Apr 2024',
    highlights: [
      'Integrated UI components using TypeScript',
      'Improved page transitions and interaction flow',
      'Resolved cross-browser compatibility issues',
    ],
  },
];

const Experience = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <section id="experience" className="experience" ref={ref}>
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="section-title"
        >
          experience
        </motion.h2>

        <motion.div
          className="timeline"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {experiences.map((exp, index) => (
            <motion.div key={exp.id} variants={itemVariants} className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
                {index !== experiences.length - 1 && <div className="timeline-line"></div>}
              </div>
              <div className="timeline-content glass-card">
                <div className="timeline-header">
                  <h3 className="timeline-role">{exp.role}</h3>
                  <span className="timeline-period">{exp.period}</span>
                </div>
                <p className="timeline-company">{exp.company} • {exp.location}</p>
                <ul className="timeline-highlights">
                  {exp.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
                {exp.tech && (
                  <div className="timeline-tech">
                    {exp.tech.map((tech, idx) => (
                      <span key={idx} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
