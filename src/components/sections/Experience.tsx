import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Experience.css';

interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  period: string;
  highlights: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: 1,
    role: 'Software Engineer',
    company: 'Your Company',
    period: '2023 - Present',
    highlights: [
      'Developed high-performance rendering systems with optimized GPU pipelines',
      'Implemented custom memory allocators reducing allocation overhead by 40%',
    ],
  },
  {
    id: 2,
    role: 'Game Developer',
    company: 'Previous Company',
    period: '2021 - 2023',
    highlights: [
      'Built real-time physics simulation engine for multiplayer games',
      'Optimized frame time from 60ms to 16ms through profiling and refactoring',
    ],
  },
  {
    id: 3,
    role: 'Junior Developer',
    company: 'First Company',
    period: '2020 - 2021',
    highlights: [
      'Designed and implemented gameplay systems and tools',
      'Collaborated with artists to develop custom shader pipelines',
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
          Experience
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
                <p className="timeline-company">{exp.company}</p>
                <ul className="timeline-highlights">
                  {exp.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
