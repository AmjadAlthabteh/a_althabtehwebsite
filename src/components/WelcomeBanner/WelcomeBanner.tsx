import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './WelcomeBanner.css';

// 3D Rocket Component
const Rocket = () => {
  const rocketRef = useRef<THREE.Group>(null);
  const engineFlameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (rocketRef.current) {
      const time = state.clock.getElapsedTime();
      // Rocket flies from left to center
      rocketRef.current.position.x = Math.min(-15 + time * 8, 2);
      rocketRef.current.position.y = Math.sin(time * 0.5) * 0.3;
      rocketRef.current.rotation.z = Math.sin(time) * 0.05;
    }

    // Engine flame flicker
    if (engineFlameRef.current) {
      const time = state.clock.getElapsedTime();
      engineFlameRef.current.scale.y = 1 + Math.sin(time * 20) * 0.2;
    }
  });

  return (
    <group ref={rocketRef} position={[-15, 0, 0]} rotation={[0, 0, 0]}>
      {/* Main body - cone */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.5, 2.5, 8]} />
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.9}
          roughness={0.2}
          emissive="#444444"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[0.5, 0.8, 8]} />
        <meshStandardMaterial
          color="#ff4444"
          metalness={0.8}
          roughness={0.3}
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Window */}
      <mesh position={[0, 0.5, 0.5]}>
        <circleGeometry args={[0.25, 16]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Fins */}
      {[0, 90, 180, 270].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((angle * Math.PI) / 180) * 0.5,
            -1,
            Math.cos((angle * Math.PI) / 180) * 0.5
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0]}
        >
          <boxGeometry args={[0.1, 0.8, 0.6]} />
          <meshStandardMaterial
            color="#c0c0c0"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Engine flames */}
      <group ref={engineFlameRef} position={[0, -1.5, 0]}>
        <mesh>
          <coneGeometry args={[0.4, 1.5, 8]} />
          <meshBasicMaterial
            color="#ff6600"
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <coneGeometry args={[0.3, 1.2, 8]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[0.2, 0.8, 8]} />
          <meshBasicMaterial
            color="#ffff00"
          />
        </mesh>
        {/* Engine glow */}
        <pointLight
          color="#ff6600"
          intensity={5}
          distance={10}
          position={[0, -0.5, 0]}
        />
      </group>

      {/* Rocket lights */}
      <pointLight
        color="#ffffff"
        intensity={2}
        distance={5}
        position={[0, 1, 0]}
      />
    </group>
  );
};

// 3D Planet Component
const Planet = ({ position, size, color, emissive, rotationSpeed = 0.002 }: {
  position: [number, number, number];
  size: number;
  color: string;
  emissive: string;
  rotationSpeed?: number;
}) => {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group position={position}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={1.1}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Planet light */}
      <pointLight
        color={emissive}
        intensity={1}
        distance={size * 5}
      />
    </group>
  );
};

// 3D Scene Component
const SpaceScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 12]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4466ff" />

      {/* Stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Planets */}
      <Planet
        position={[6, 2, -5]}
        size={2}
        color="#4a90e2"
        emissive="#2c5aa0"
        rotationSpeed={0.001}
      />
      <Planet
        position={[8, -2, -8]}
        size={1.5}
        color="#e24a4a"
        emissive="#a02c2c"
        rotationSpeed={0.0015}
      />
      <Planet
        position={[10, 0, -12]}
        size={3}
        color="#4ae290"
        emissive="#2ca05a"
        rotationSpeed={0.0008}
      />
      <Planet
        position={[5, -3, -3]}
        size={1}
        color="#e2d24a"
        emissive="#a09a2c"
        rotationSpeed={0.002}
      />

      {/* Rocket */}
      <Rocket />
    </>
  );
};

const WelcomeBanner = () => {
  const [hide, setHide] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3;
      });
    }, 40);

    // Hide banner after animation
    const timer = setTimeout(() => {
      setHide(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className={`welcome-banner ${hide ? 'hide' : ''}`}>
      <div className="canvas-container">
        <Canvas>
          <SpaceScene />
        </Canvas>
      </div>

      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-glow" style={{ left: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
