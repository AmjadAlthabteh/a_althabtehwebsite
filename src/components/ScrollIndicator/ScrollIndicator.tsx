import { useEffect, useState } from 'react';
import './ScrollIndicator.css';

interface ScrollIndicatorProps {
  sections: string[];
}

const ScrollIndicator = ({ sections }: ScrollIndicatorProps) => {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sections[index]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToNext = () => {
    if (activeSection < sections.length - 1) {
      scrollToSection(activeSection + 1);
    }
  };

  const scrollToPrev = () => {
    if (activeSection > 0) {
      scrollToSection(activeSection - 1);
    }
  };

  return (
    <>
      <div className="scroll-indicator">
        {sections.map((section, index) => (
          <button
            key={section}
            className={`scroll-dot ${index === activeSection ? 'active' : ''}`}
            onClick={() => scrollToSection(index)}
            aria-label={`Go to ${section} section`}
          >
            <span className="scroll-dot-label">{section}</span>
          </button>
        ))}
      </div>

      <div className="scroll-arrows">
        {activeSection > 0 && (
          <button
            className="scroll-arrow scroll-arrow-up"
            onClick={scrollToPrev}
            aria-label="Scroll to previous section"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M12 5L5 12M12 5L19 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {activeSection < sections.length - 1 && (
          <button
            className="scroll-arrow scroll-arrow-down"
            onClick={scrollToNext}
            aria-label="Scroll to next section"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M12 19L19 12M12 19L5 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};

export default ScrollIndicator;
