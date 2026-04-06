import { useEffect, useState } from 'react';
import './KeyboardNav.css';

const KeyboardNav = () => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const sections = ['home', 'about', 'projects', 'experience', 'skills', 'contact'];
    let currentSection = 0;

    const scrollToSection = (index: number) => {
      const sectionId = sections[index];
      const element = document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (index === 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case '?':
          setShowHelp((prev) => !prev);
          e.preventDefault();
          break;
        case 'j':
        case 'ArrowDown':
          if (!e.shiftKey) {
            currentSection = Math.min(currentSection + 1, sections.length - 1);
            scrollToSection(currentSection);
            e.preventDefault();
          }
          break;
        case 'k':
        case 'ArrowUp':
          if (!e.shiftKey) {
            currentSection = Math.max(currentSection - 1, 0);
            scrollToSection(currentSection);
            e.preventDefault();
          }
          break;
        case 'Home':
        case 'g':
          currentSection = 0;
          scrollToSection(0);
          e.preventDefault();
          break;
        case 'End':
        case 'G':
          currentSection = sections.length - 1;
          scrollToSection(currentSection);
          e.preventDefault();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const index = parseInt(e.key) - 1;
          if (index >= 0 && index < sections.length) {
            currentSection = index;
            scrollToSection(index);
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {showHelp && (
        <div className="keyboard-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="keyboard-help" onClick={(e) => e.stopPropagation()}>
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div className="keyboard-shortcuts">
              <div className="shortcut-group">
                <h3>Navigation</h3>
                <div className="shortcut">
                  <kbd>j</kbd> or <kbd>↓</kbd>
                  <span>Next section</span>
                </div>
                <div className="shortcut">
                  <kbd>k</kbd> or <kbd>↑</kbd>
                  <span>Previous section</span>
                </div>
                <div className="shortcut">
                  <kbd>g</kbd> or <kbd>Home</kbd>
                  <span>Go to top</span>
                </div>
                <div className="shortcut">
                  <kbd>G</kbd> or <kbd>End</kbd>
                  <span>Go to bottom</span>
                </div>
              </div>

              <div className="shortcut-group">
                <h3>Quick Jump</h3>
                <div className="shortcut">
                  <kbd>1</kbd>
                  <span>Home</span>
                </div>
                <div className="shortcut">
                  <kbd>2</kbd>
                  <span>About</span>
                </div>
                <div className="shortcut">
                  <kbd>3</kbd>
                  <span>Projects</span>
                </div>
                <div className="shortcut">
                  <kbd>4</kbd>
                  <span>Experience</span>
                </div>
                <div className="shortcut">
                  <kbd>5</kbd>
                  <span>Skills</span>
                </div>
                <div className="shortcut">
                  <kbd>6</kbd>
                  <span>Contact</span>
                </div>
              </div>

              <div className="shortcut-group">
                <h3>Other</h3>
                <div className="shortcut">
                  <kbd>?</kbd>
                  <span>Toggle this help</span>
                </div>
                <div className="shortcut">
                  <kbd>Shift</kbd> + <kbd>F</kbd>
                  <span>Toggle FPS monitor</span>
                </div>
              </div>
            </div>
            <button className="close-help" onClick={() => setShowHelp(false)}>
              Close (Esc or ?)
            </button>
          </div>
        </div>
      )}

      <button className="keyboard-hint" onClick={() => setShowHelp(true)}>
        Press <kbd>?</kbd> for shortcuts
      </button>
    </>
  );
};

export default KeyboardNav;
