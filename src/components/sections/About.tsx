import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './About.css';

const About = () => {
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" className="about" ref={ref}>
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.h2 variants={itemVariants} className="section-title">
            About Me
          </motion.h2>

          <motion.div variants={itemVariants} className="about-content">
            <p className="about-text">
              I'm a software engineer specializing in <span className="highlight">game development</span>,{' '}
              <span className="highlight">real-time graphics</span>, and{' '}
              <span className="highlight">systems programming</span>. I'm passionate about building
              high-performance systems that push the boundaries of what's possible.
            </p>

            <p className="about-text">
              My expertise spans across <strong>game engines</strong>, <strong>graphics APIs</strong>,
              and <strong>low-level systems</strong>. I thrive on optimizing memory management,
              implementing complex rendering pipelines, and creating immersive interactive experiences.
            </p>

            <p className="about-text">
              When I'm not coding, I'm exploring new technologies in <strong>XR</strong>,{' '}
              <strong>GPU programming</strong>, and <strong>real-time simulation</strong>. I believe
              in writing clean, performant code that solves real problems.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="about-visual">
            <div className="code-block">
              <div className="code-header">
                <span className="code-dot"></span>
                <span className="code-dot"></span>
                <span className="code-dot"></span>
              </div>
              <pre className="code-content">
                <code>
{`const engineer = {
  name: "Amjad Althabteh",
  focus: ["Performance", "Graphics", "Systems"],
  passion: "Building real-time experiences",
  location: "Pushing pixels & optimizing code"
};`}
                </code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
