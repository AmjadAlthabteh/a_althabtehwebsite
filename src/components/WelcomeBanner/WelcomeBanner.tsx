import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './WelcomeBanner.css';

// Simple spacecraft that launches upward
const Spacecraft = () => {
  const spacecraftRef = useRef<THREE.Group>(null);
  const engineFlameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (spacecraftRef.current) {
      const time = state.clock.getElapsedTime();

      // Launch straight up with acceleration
      const acceleration = Math.pow(time * 0.8, 2);
      spacecraftRef.current.position.y = -3 + acceleration;
      spacecraftRef.current.position.z = -5 - time * 2;

      // Slight rotation for dynamic effect
      spacecraftRef.current.rotation.x = time * 0.5;
      spacecraftRef.current.rotation.y = Math.sin(time) * 0.1;
    }

    // Flickering engine flame
    if (engineFlameRef.current) {
      const time = state.clock.getElapsedTime();
      engineFlameRef.current.scale.y = 1 + Math.sin(time * 25) * 0.3;
    }
  });

  return (
    <group ref={spacecraftRef} position={[0, -3, -5]}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 2, 32]} />
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[0.3, 1, 32]} />
        <meshStandardMaterial
          color="#ff4444"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Window */}
      <mesh position={[0, 0.5, 0.31]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ccff"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Fins */}
      {[0, 120, 240].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((angle * Math.PI) / 180) * 0.4,
            -1,
            Math.cos((angle * Math.PI) / 180) * 0.4
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0]}
        >
          <boxGeometry args={[0.05, 0.8, 0.8]} />
          <meshStandardMaterial
            color="#666666"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Engine flames */}
      <group ref={engineFlameRef} position={[0, -1.5, 0]}>
        <mesh>
          <coneGeometry args={[0.5, 2, 16]} />
          <meshBasicMaterial
            color="#ff5500"
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <coneGeometry args={[0.35, 1.6, 16]} />
          <meshBasicMaterial
            color="#ffaa00"
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[0.2, 1.2, 16]} />
          <meshBasicMaterial
            color="#ffff00"
            transparent
            opacity={0.95}
          />
        </mesh>
        <pointLight
          color="#ff6600"
          intensity={10}
          distance={20}
          position={[0, -1, 0]}
        />
      </group>
    </group>
  );
};

// Floating particles for welcome scene
const FloatingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// 3D Launch Scene
const LaunchScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" />

      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <Spacecraft />
    </>
  );
};

// 3D Welcome Scene
const WelcomeScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#4444ff" />

      <Stars
        radius={150}
        depth={80}
        count={3000}
        factor={5}
        saturation={0}
        fade
        speed={0.3}
      />

      <FloatingParticles />

      {/* Nebula effects */}
      <mesh position={[8, 5, -20]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial
          color="#6600ff"
          transparent
          opacity={0.08}
        />
      </mesh>
      <mesh position={[-10, -5, -25]}>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial
          color="#0088ff"
          transparent
          opacity={0.06}
        />
      </mesh>
    </>
  );
};

const WelcomeBanner = () => {
  const [phase, setPhase] = useState<'launch' | 'welcome' | 'final' | 'hide'>('launch');

  useEffect(() => {
    // Phase 1: Launch - 3 seconds
    const launchTimer = setTimeout(() => {
      setPhase('welcome');
    }, 3000);

    // Phase 2: Welcome in - 4 seconds
    const welcomeTimer = setTimeout(() => {
      setPhase('final');
    }, 7000);

    // Phase 3: Final message - 3 seconds
    const finalTimer = setTimeout(() => {
      setPhase('hide');
    }, 10000);

    return () => {
      clearTimeout(launchTimer);
      clearTimeout(welcomeTimer);
      clearTimeout(finalTimer);
    };
  }, []);

  return (
    <div className={`welcome-banner ${phase === 'hide' ? 'hide' : ''}`}>
      {/* Launch phase with 3D spacecraft */}
      {phase === 'launch' && (
        <div className="canvas-container">
          <Canvas>
            <LaunchScene />
          </Canvas>
        </div>
      )}

      {/* Welcome phase with 3D space background */}
      {phase === 'welcome' && (
        <>
          <div className="canvas-container">
            <Canvas>
              <WelcomeScene />
            </Canvas>
          </div>
          <div className="welcome-message">
            <h1 className="welcome-text">Welcome in</h1>
          </div>
        </>
      )}

      {/* Final message phase */}
      {phase === 'final' && (
        <div className="final-message">
          <h2 className="final-text">Hope you enjoy exploring</h2>
        </div>
      )}
    </div>
  );
};

export default WelcomeBanner;
