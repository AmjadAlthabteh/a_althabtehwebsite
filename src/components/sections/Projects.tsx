import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Projects.css';

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Glint3D',
    description: 'Lightweight 3D rendering engine with cross-platform support for desktop and web. Features PBR materials, CPU raytracing, JSON-based scripting, and headless rendering for CI/CD pipelines.',
    tech: ['C++', 'OpenGL', 'WebGL', 'TypeScript', 'React', 'Emscripten'],
    github: 'https://github.com/AmjadAlthabteh/glint_3d_frk',
  },
  {
    id: 2,
    title: 'AI Debugger',
    description: 'Advanced C++ debugging tool that analyzes crash stack traces to automatically identify root causes, explain bugs in natural language, and generate fix suggestions with confidence scoring.',
    tech: ['C++', 'LLVM', 'CMake', 'Machine Learning', 'Static Analysis'],
    github: 'https://github.com/AmjadAlthabteh/LLVM_Opt_ml',
  },
  {
    id: 3,
    title: 'Opsmind',
    description: 'Production-grade AI-powered incident management system. Real-time detection and root cause analysis using GPT-4, RAG, and WebSocket collaboration with full observability stack.',
    tech: ['Python', 'FastAPI', 'React', 'LangChain', 'Docker', 'Kubernetes'],
    github: 'https://github.com/AmjadAlthabteh/Opsmind',
  },
];

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="projects" className="projects" ref={ref}>
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="section-title"
        >
          Featured Projects
        </motion.h2>

        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={cardVariants} className="project-card glass-card">
              <div className="project-preview">
                <div className="project-preview-icon">{'</>'}</div>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      GitHub
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
