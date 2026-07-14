import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Skills.css';

interface Skill {
  name: string;
  icon: string;
  color: string;
}

interface SkillCategory {
  title: string;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'languages',
    skills: [
      { name: 'c++', icon: '⚡', color: '#00599C' },
      { name: 'c#', icon: '🎯', color: '#239120' },
      { name: 'typescript', icon: '📘', color: '#3178C6' },
      { name: 'javascript', icon: '📜', color: '#F7DF1E' },
      { name: 'python', icon: '🐍', color: '#3776AB' },
      { name: 'glsl', icon: '🎨', color: '#5586A4' },
      { name: 'hlsl', icon: '🔷', color: '#0078D7' },
    ],
  },
  {
    title: 'engines & graphics',
    skills: [
      { name: 'unreal engine', icon: '🎮', color: '#0E1128' },
      { name: 'unity', icon: '🕹️', color: '#000000' },
      { name: 'opengl', icon: '🔺', color: '#5586A4' },
      { name: 'vulkan', icon: '🌋', color: '#AC162C' },
      { name: 'directx', icon: '💎', color: '#0078D7' },
      { name: 'webgl', icon: '🌐', color: '#990000' },
      { name: 'three.js', icon: '🎲', color: '#000000' },
    ],
  },
  {
    title: 'frameworks & tools',
    skills: [
      { name: 'react', icon: '⚛️', color: '#61DAFB' },
      { name: 'node.js', icon: '📗', color: '#339933' },
      { name: 'git', icon: '🔀', color: '#F05032' },
      { name: 'cmake', icon: '🔧', color: '#064F8C' },
      { name: 'visual studio', icon: '💻', color: '#5C2D91' },
      { name: 'renderdoc', icon: '📊', color: '#EF5350' },
      { name: 'nsight', icon: '📈', color: '#76B900' },
    ],
  },
  {
    title: 'systems & concepts',
    skills: [
      { name: 'memory management', icon: '🧠', color: '#FF6B6B' },
      { name: 'multithreading', icon: '🔄', color: '#4ECDC4' },
      { name: 'data structures', icon: '🗂️', color: '#95E1D3' },
      { name: 'performance optimization', icon: '⚡', color: '#F38181' },
      { name: 'low-latency systems', icon: 'lt', color: '#06B6D4' },
      { name: 'benchmarking', icon: 'p99', color: '#2563EB' },
      { name: 'throughput testing', icon: 'ops', color: '#10B981' },
      { name: 'rendering pipelines', icon: '🎬', color: '#AA96DA' },
      { name: 'physics simulation', icon: '🌊', color: '#FCBAD3' },
    ],
  },
];

const Skills = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section id="skills" className="skills" ref={ref}>
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="section-title"
        >
          skills
        </motion.h2>

        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {skillCategories.map((category, index) => (
            <motion.div key={index} variants={categoryVariants} className="skill-category">
              <h3 className="category-title">{category.title}</h3>
              <motion.div
                className="skills-list"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
              >
                {category.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skillIndex}
                    variants={skillVariants}
                    className="skill-badge"
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{
                      '--skill-color': skill.color,
                    } as React.CSSProperties}
                  >
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
