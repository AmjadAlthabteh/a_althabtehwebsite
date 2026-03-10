import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import './Projects.css';

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  category: string[];
  featured?: boolean;
  github?: string;
  demo?: string;
  youtube?: string;
  video?: string;
  image?: string;
}

const projects: Project[] = [
  {
    id: 0,
    title: 'glint3d',
    description: 'lightweight 3d rendering engine with cross-platform support for desktop and web. features pbr materials, cpu raytracing, json-based scripting, and headless rendering for ci/cd pipelines.',
    tech: ['c++', 'opengl', 'webgl', 'typescript', 'react', 'emscripten'],
    category: ['graphics', 'engine', 'web'],
    featured: true,
    video: '/videos/glint.mp4',
    image: '/images/glint3d.png',
  },
  {
    id: 1,
    title: 'ai debugger',
    description: 'advanced c++ debugging tool that analyzes crash stack traces to automatically identify root causes, explain bugs in natural language, and generate fix suggestions with confidence scoring.',
    tech: ['c++', 'llvm', 'cmake', 'machine learning', 'static analysis'],
    category: ['systems', 'ai', 'tools'],
    featured: true,
    github: 'https://github.com/AmjadAlthabteh/LLVM_Opt_ml',
    image: '/images/llvm_debugger_c++.png',
  },
  {
    id: 2,
    title: 'maple',
    description: 'influencer-inspired platform with auto-editing capabilities. built for cinematic content creation, inspired by unreal engine cinematics project. features automated paragraph editing and image processing.',
    tech: ['react', 'typescript', 'netlify'],
    category: ['web', 'creative'],
    demo: 'https://themaple.netlify.app/',
    image: '/images/maple_picture.png',
  },
  {
    id: 3,
    title: 'opsmind',
    description: 'production-grade incident management system. real-time detection and root cause analysis.',
    tech: ['python', 'fastapi', 'react', 'docker', 'kubernetes'],
    category: ['web', 'devops', 'systems'],
    github: 'https://github.com/AmjadAlthabteh/Opsmind',
  },
  {
    id: 4,
    title: 'no one answers',
    description: 'short film clip showcasing narrative storytelling and cinematography.',
    tech: ['video production', 'cinematography'],
    category: ['creative'],
    youtube: 'https://www.youtube.com/watch?v=Fe1U5l1r19o',
    image: '/images/video_clip_nooneanwsers.png',
  },
  {
    id: 5,
    title: 'hft orderbook engine',
    description: 'high-frequency trading algorithm with low-latency limit orderbook. implements fifo matching logic, spread crossing detection, and trade aggregation using cache-efficient containers. features microsecond-precision benchmarking and lock-free architecture for optimal performance.',
    tech: ['c++20', 'low-latency', 'lock-free', 'cache-optimization', 'performance'],
    category: ['systems', 'performance'],
    github: 'https://github.com/AmjadAlthabteh/hft-orderbook-engine_2',
    image: '/images/hft_orderbook.svg',
  },
  {
    id: 6,
    title: '3d lunar synthetic project',
    description: 'advanced 3d rendering and physics simulation for lunar terrain generation. combines procedural terrain synthesis with realistic physics modeling, featuring dynamic lighting, material systems, and real-time gravitational interactions.',
    tech: ['3d graphics', 'physics', 'procedural generation', 'opengl', 'rendering'],
    category: ['graphics', 'systems'],
    video: '/videos/planets.mp4',
    image: '/images/orbital_collision.png',
  },
  {
    id: 7,
    title: 'orbital engine simulation',
    description: 'physics-based orbital mechanics engine for simulating spacecraft trajectories and planetary motion. implements keplerian orbital elements, trajectory prediction, and gravitational n-body dynamics with real-time visualization.',
    tech: ['physics simulation', 'orbital mechanics', 'n-body dynamics', 'trajectory prediction'],
    category: ['systems', 'graphics'],
    youtube: 'https://youtu.be/2cyNay55F6o',
    image: '/images/Mars_1.png',
  },
];

const filters = ['all', 'graphics', 'systems', 'web', 'ai', 'creative', 'performance'];

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(project => project.category.includes(activeFilter));

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
          projects
        </motion.h2>

        <motion.div
          className="project-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          key={activeFilter}
        >
          {filteredProjects.map((project) => (
            <motion.div key={project.id} variants={cardVariants} className={`project-card glass-card ${project.featured ? 'featured' : ''}`}>
              {project.featured && (
                <div className="featured-badge">
                  <span>⭐</span> featured
                </div>
              )}
              <div className="project-preview">
                {project.video ? (
                  <video
                    src={project.video}
                    className="project-image"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : project.image ? (
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
                      github →
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      live demo →
                    </a>
                  )}
                  {project.youtube && (
                    <a
                      href={project.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      watch →
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
