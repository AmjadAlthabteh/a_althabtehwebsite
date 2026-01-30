import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import './RotatingCube.css';

const Shape = ({
  mousePosition,
  type,
  delay = 0
}: {
  mousePosition: { x: number; y: number };
  type: 'box' | 'sphere' | 'torus';
  delay?: number;
}) => {
  const meshRef = useRef<Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth lerp to mouse position
    targetRotation.current.x += (mousePosition.y * 2 - targetRotation.current.x) * 0.05;
    targetRotation.current.y += (mousePosition.x * 2 - targetRotation.current.y) * 0.05;

    meshRef.current.rotation.x = targetRotation.current.x;
    meshRef.current.rotation.y = targetRotation.current.y;

    // Continuous auto-rotation
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.3 + delay;

    // Dramatic float animation
    const time = state.clock.elapsedTime + delay;
    meshRef.current.position.y = Math.sin(time * 0.8) * 0.4;
    meshRef.current.position.x = Math.cos(time * 0.6) * 0.3;

    // Pulsing scale based on mouse movement
    const mouseMagnitude = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2);
    const scale = 1 + mouseMagnitude * 0.3 + Math.sin(time * 2) * 0.1;
    meshRef.current.scale.set(scale, scale, scale);
  });

  const geometry = type === 'box' ? (
    <boxGeometry args={[2.2, 2.2, 2.2]} />
  ) : type === 'sphere' ? (
    <sphereGeometry args={[1.3, 32, 32]} />
  ) : (
    <torusGeometry args={[1.2, 0.4, 16, 100]} />
  );

  // Different colors for each shape
  const colors = {
    box: { main: '#00ccff', emissive: '#cc00ff' },
    sphere: { main: '#ffcc00', emissive: '#ff6600' },
    torus: { main: '#00ff88', emissive: '#ff0066' }
  };

  return (
    <mesh ref={meshRef}>
      {geometry}
      <meshStandardMaterial
        color={colors[type].main}
        wireframe={true}
        emissive={colors[type].emissive}
        emissiveIntensity={1.2}
        transparent={true}
        opacity={0.75}
      />
    </mesh>
  );
};

const RotatingCube = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [globalMousePos, setGlobalMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setGlobalMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePosition({ x, y });
  };

  const activePos = mousePosition.x !== 0 || mousePosition.y !== 0 ? mousePosition : globalMousePos;

  return (
    <div className="rotating-cube-container" onMouseMove={handleMouseMove}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00ccff" />
        <pointLight position={[-5, -5, 5]} intensity={1.2} color="#cc00ff" />
        <pointLight position={[0, 0, 10]} intensity={1} color="#ffcc00" />

        <Shape mousePosition={activePos} type="box" delay={0} />
        <Shape mousePosition={activePos} type="sphere" delay={1} />
      </Canvas>
      <div className="cube-glow" />
    </div>
  );
};

export default RotatingCube;
