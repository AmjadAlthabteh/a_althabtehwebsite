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
  youtube?: string;
  image?: string;
}

const projects: Project[] = [
  {
    id: 0,
    title: 'Maple',
    description: 'Influencer-inspired platform with auto-editing capabilities. Built for cinematic content creation, inspired by Unreal Engine cinematics project. Features automated paragraph editing and image processing.',
    tech: ['React', 'TypeScript', 'Netlify'],
    demo: 'https://themaple.netlify.app/',
    image: '/images/maple_picture.png',
  },
  {
    id: 1,
    title: 'No One Answers Short Clip',
    description: 'Short film clip',
    tech: ['Video Production'],
    youtube: 'https://www.youtube.com/watch?v=Fe1U5l1r19o',
    image: '/images/video_clip_nooneanwsers.png',
  },
  {
    id: 2,
    title: 'Glint3D',
    description: 'Lightweight 3D rendering engine with cross-platform support for desktop and web. Features PBR materials, CPU raytracing, JSON-based scripting, and headless rendering for CI/CD pipelines.',
    tech: ['C++', 'OpenGL', 'WebGL', 'TypeScript', 'React', 'Emscripten'],
    github: 'https://github.com/AmjadAlthabteh/glint_3d_frk',
    image: '/images/glint3d.png',
  },
  {
    id: 3,
    title: 'AI Debugger',
    description: 'Advanced C++ debugging tool that analyzes crash stack traces to automatically identify root causes, explain bugs in natural language, and generate fix suggestions with confidence scoring.',
    tech: ['C++', 'LLVM', 'CMake', 'Machine Learning', 'Static Analysis'],
    github: 'https://github.com/AmjadAlthabteh/LLVM_Opt_ml',
    image: '/images/llvm_debugger_c++.png',
  },
  {
    id: 4,
    title: 'Opsmind',
    description: 'Production-grade incident management system. Real-time detection and root cause analysis.',
    tech: ['Python', 'FastAPI', 'React', 'Docker', 'Kubernetes'],
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
                {project.image ? (
                  <img src={project.image} alt={project.title} className="project-image" />
                ) : (
                  <div className="project-preview-icon">{'</>'}</div>
                )}
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
                  {project.youtube && (
                    <a
                      href={project.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      Watch on YouTube
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
