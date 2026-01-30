import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Skills.css';

interface SkillCategory {
  title: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Languages',
    skills: ['C++', 'C#', 'TypeScript', 'JavaScript', 'Python', 'GLSL', 'HLSL'],
  },
  {
    title: 'Engines & Graphics',
    skills: ['Unreal Engine', 'Unity', 'OpenGL', 'Vulkan', 'DirectX', 'WebGL', 'Three.js'],
  },
  {
    title: 'Frameworks & Tools',
    skills: ['React', 'Node.js', 'Git', 'CMake', 'Visual Studio', 'RenderDoc', 'Nsight'],
  },
  {
    title: 'Systems & Concepts',
    skills: [
      'Memory Management',
      'Multithreading',
      'Data Structures',
      'Performance Optimization',
      'Rendering Pipelines',
      'Physics Simulation',
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
          Skills & Tech Stack
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
                  >
                    {skill}
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
