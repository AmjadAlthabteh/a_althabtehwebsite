import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Contact.css';

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
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
    <section id="contact" className="contact" ref={ref}>
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="contact-content"
        >
          <motion.h2 variants={itemVariants} className="section-title">
            let's work together
          </motion.h2>

          <motion.p variants={itemVariants} className="contact-description">
            interested in hearing about new projects and opportunities.
            have a question or just want to say hi? reach out.
          </motion.p>

          <motion.div variants={itemVariants} className="contact-links">
            <a
              href="mailto:amjadjamalshadi@gmail.com"
              className="contact-card glass-card"
            >
              <div className="contact-info">
                <h3>email</h3>
                <p>amjadjamalshadi@gmail.com</p>
              </div>
            </a>

            <a
              href="https://github.com/AmjadAlthabteh"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card glass-card"
            >
              <div className="contact-info">
                <h3>github</h3>
                <p>@amjadalthabteh</p>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/amjad-althabteh/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card glass-card"
            >
              <div className="contact-info">
                <h3>linkedin</h3>
                <p>amjad althabteh</p>
              </div>
            </a>

            <a
              href="https://x.com/aeroBoyC"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card glass-card"
            >
              <div className="contact-info">
                <h3>x</h3>
                <p>@aeroBoyC</p>
              </div>
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="contact-footer">
            <p>designed & built by amjad althabteh</p>
            <p className="copyright">© 2025</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
