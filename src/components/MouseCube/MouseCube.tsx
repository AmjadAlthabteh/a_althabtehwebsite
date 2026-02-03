import { useEffect, useRef } from 'react';
import './MouseCube.css';

const MouseCube = () => {
  const cubeRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const cubeX = useRef(0);
  const cubeY = useRef(0);
  const rotateX = useRef(0);
  const rotateY = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Smooth follow effect
      cubeX.current += (mouseX.current - cubeX.current) * 0.1;
      cubeY.current += (mouseY.current - cubeY.current) * 0.1;

      // Rotation based on mouse position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const targetRotateY = ((mouseX.current - centerX) / centerX) * 45;
      const targetRotateX = ((mouseY.current - centerY) / centerY) * -45;

      rotateX.current += (targetRotateX - rotateX.current) * 0.1;
      rotateY.current += (targetRotateY - rotateY.current) * 0.1;

      if (cubeRef.current) {
        cubeRef.current.style.transform = `
          translate(-50%, -50%)
          translate(${cubeX.current}px, ${cubeY.current}px)
          rotateX(${rotateX.current}deg)
          rotateY(${rotateY.current}deg)
        `;
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="mouse-cube-container">
      <div ref={cubeRef} className="cube">
        <div className="cube-face front"></div>
        <div className="cube-face back"></div>
        <div className="cube-face left"></div>
        <div className="cube-face right"></div>
        <div className="cube-face top"></div>
        <div className="cube-face bottom"></div>
      </div>
    </div>
  );
};

export default MouseCube;
