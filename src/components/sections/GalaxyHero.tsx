import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import './GalaxyHero.css';

// Realistic Planet Component
function Planet({
  position,
  size,
  color,
  emissive,
  orbitRadius,
  orbitSpeed,
  rotationSpeed,
  hasRings = false,
  ringColor,
  atmosphereColor,
  roughness = 0.7,
  metalness = 0.2,
  hasAtmosphere = true,
}: {
  position: [number, number, number];
  size: number;
  color: string;
  emissive: string;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  hasRings?: boolean;
  ringColor?: string;
  atmosphereColor?: string;
  roughness?: number;
  metalness?: number;
  hasAtmosphere?: boolean;
}) {
  const planetRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (planetRef.current) {
      const time = state.clock.elapsedTime;
      planetRef.current.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
      planetRef.current.position.z = Math.sin(time * orbitSpeed) * orbitRadius;
      planetRef.current.position.y = Math.sin(time * orbitSpeed * 0.5) * 1.5;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={planetRef} position={position}>
      {/* Main Planet Body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[size, 128, 128]} />
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness}
          emissive={emissive}
          emissiveIntensity={0.35}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Surface detail overlay for texture */}
      <mesh scale={1.002}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere Glow */}
      {hasAtmosphere && (
        <>
          <mesh scale={1.08}>
            <sphereGeometry args={[size, 64, 64]} />
            <meshBasicMaterial
              color={atmosphereColor || emissive}
              transparent
              opacity={0.25}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          <mesh scale={1.15}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshBasicMaterial
              color={atmosphereColor || emissive}
              transparent
              opacity={0.1}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}

      {/* Realistic Ring System (Saturn-style) */}
      {hasRings && (
        <group rotation={[Math.PI / 2.8, 0.1, 0]}>
          {/* Main ring */}
          <mesh>
            <ringGeometry args={[size * 1.5, size * 2.5, 128]} />
            <meshStandardMaterial
              color={ringColor || color}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              roughness={0.9}
              metalness={0.1}
              emissive={ringColor || color}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Secondary ring (Cassini Division) */}
          <mesh>
            <ringGeometry args={[size * 2.6, size * 2.8, 128]} />
            <meshStandardMaterial
              color={ringColor || color}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>

          {/* Ring glow */}
          <mesh>
            <ringGeometry args={[size * 1.5, size * 2.8, 64]} />
            <meshBasicMaterial
              color={ringColor || color}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* Point light from planet */}
      <pointLight
        color={emissive}
        intensity={0.6}
        distance={size * 10}
        decay={2}
      />
    </group>
  );
}

// Enhanced Spiral Galaxy
function SpiralGalaxy() {
  const galaxyRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 25000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const branches = 5;
    const spin = 0.8;
    const randomness = 0.3;
    const randomnessPower = 4;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 12;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const spinAngle = radius * spin;

      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * 0.2;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color based on distance from center
      const mixedColor = new THREE.Color();
      const innerColor = new THREE.Color('#ff6030');
      const middleColor = new THREE.Color('#1b3984');
      const outerColor = new THREE.Color('#4a1e6e');

      if (radius < 4) {
        mixedColor.lerpColors(innerColor, middleColor, radius / 4);
      } else {
        mixedColor.lerpColors(middleColor, outerColor, (radius - 4) / 8);
      }

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 0.08 + 0.02;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      galaxyRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.05 - 0.3;
    }
  });

  return (
    <points ref={galaxyRef} position={[0, -2, -15]}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" count={positions.length / 3} />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" count={colors.length / 3} />
        <bufferAttribute args={[sizes, 1]} attach="attributes-size" count={sizes.length} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={`
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;

          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * 300.0 / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;

          void main() {
            float distanceToCenter = length(gl_PointCoord - vec2(0.5));
            float strength = 1.0 - distanceToCenter * 2.0;
            strength = max(strength, 0.0);

            vec3 finalColor = vColor * strength;
            float alpha = strength;

            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Twinkling Star Field
function StarField() {
  const starsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 30 + Math.random() * 40;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const colorVariation = 0.8 + Math.random() * 0.2;
      colors[i3] = colorVariation;
      colors[i3 + 1] = colorVariation * 0.95;
      colors[i3 + 2] = 1.0;

      sizes[i] = Math.random() * 0.05 + 0.02;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      const material = starsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" count={positions.length / 3} />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" count={colors.length / 3} />
        <bufferAttribute args={[sizes, 1]} attach="attributes-size" count={sizes.length} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={{
          uTime: { value: 0 }
        }}
        vertexShader={`
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float uTime;

          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

            float twinkle = sin(uTime * 2.0 + position.x * 100.0) * 0.3 + 0.7;
            gl_PointSize = size * twinkle * 400.0 / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;

          void main() {
            float distanceToCenter = length(gl_PointCoord - vec2(0.5));
            float strength = 1.0 - distanceToCenter * 2.0;
            strength = max(strength, 0.0);

            vec3 finalColor = vColor * strength;
            gl_FragColor = vec4(finalColor, strength);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Volumetric Nebula Clouds
function NebulaClouds() {
  const nebulaGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (nebulaGroup.current) {
      nebulaGroup.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <group ref={nebulaGroup}>
      <mesh position={[-12, 6, -25]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial
          color="#1a2d5a"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[15, -5, -30]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial
          color="#3d1f5c"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 8, -22]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#4a1e1e"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Camera Movement
function CameraController() {
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    state.camera.position.y = Math.sin(time * 0.08) * 0.4;
    state.camera.position.x = Math.sin(time * 0.05) * 0.3;
    state.camera.lookAt(0, 0, -10);
  });
  return null;
}

// Main 3D Scene
function Scene() {
  return (
    <>
      <CameraController />

      {/* Advanced Lighting Setup */}
      <ambientLight intensity={0.08} color="#0a0a20" />

      {/* Main galaxy core light */}
      <pointLight position={[0, -2, -15]} intensity={2.5} color="#ff5533" distance={40} decay={2} />

      {/* Blue accent lights */}
      <pointLight position={[-15, 10, -10]} intensity={1.2} color="#3377ff" distance={45} decay={2} />
      <pointLight position={[15, -8, -12]} intensity={0.9} color="#7744ff" distance={40} decay={2} />

      {/* Rim lighting for depth */}
      <pointLight position={[0, 15, 5]} intensity={0.4} color="#6688ff" distance={50} decay={2} />
      <pointLight position={[0, -15, 5]} intensity={0.3} color="#ff4466" distance={50} decay={2} />

      {/* Directional fill light */}
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />

      {/* Fog for depth */}
      <fog attach="fog" args={['#000000', 15, 60]} />

      {/* Background Stars */}
      <StarField />

      {/* Nebula Clouds */}
      <NebulaClouds />

      {/* Central Galaxy */}
      <SpiralGalaxy />

      {/* Saturn - Majestic ringed gas giant */}
      <Planet
        position={[-10, -2, -12]}
        size={2.0}
        color="#e8d4a8"
        emissive="#f5e6c8"
        orbitRadius={14}
        orbitSpeed={0.04}
        rotationSpeed={0.003}
        hasRings={true}
        ringColor="#d4b896"
        atmosphereColor="#f5e6c8"
        roughness={0.6}
        metalness={0.1}
        hasAtmosphere={true}
      />

      {/* Neptune - Deep blue ice giant */}
      <Planet
        position={[8, 3, -8]}
        size={1.4}
        color="#2c5aa0"
        emissive="#4a7ac7"
        orbitRadius={10}
        orbitSpeed={0.07}
        rotationSpeed={0.005}
        hasRings={false}
        atmosphereColor="#5d8dd3"
        roughness={0.5}
        metalness={0.3}
        hasAtmosphere={true}
      />

      {/* Jupiter - Massive gas giant */}
      <Planet
        position={[12, -1, -15]}
        size={2.2}
        color="#c88b3a"
        emissive="#d4a05a"
        orbitRadius={16}
        orbitSpeed={0.035}
        rotationSpeed={0.006}
        hasRings={false}
        atmosphereColor="#e8c090"
        roughness={0.6}
        metalness={0.15}
        hasAtmosphere={true}
      />

      {/* Mars - The red planet */}
      <Planet
        position={[-6, 2, -10]}
        size={0.9}
        color="#c1440e"
        emissive="#e85d1c"
        orbitRadius={8}
        orbitSpeed={0.09}
        rotationSpeed={0.007}
        hasRings={false}
        atmosphereColor="#ff8855"
        roughness={0.9}
        metalness={0.1}
        hasAtmosphere={true}
      />

      {/* Uranus - Tilted ice giant */}
      <Planet
        position={[5, -4, -18]}
        size={1.5}
        color="#4fd0e7"
        emissive="#68dcf0"
        orbitRadius={12}
        orbitSpeed={0.055}
        rotationSpeed={0.004}
        hasRings={false}
        atmosphereColor="#7ee8f7"
        roughness={0.5}
        metalness={0.25}
        hasAtmosphere={true}
      />
    </>
  );
}

// Main Hero Component
const GalaxyHero = () => {
  return (
    <section id="home" className="galaxy-hero">
      {/* 3D Canvas Background */}
      <div className="galaxy-canvas-container">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.4,
          }}
          dpr={[1, 2]}
        >
          <Scene />
        </Canvas>
      </div>

      {/* Hero Content */}
      <div className="galaxy-hero-content">
        <motion.div
          className="hero-text-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <motion.h1
            className="galaxy-hero-title"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Welcome to my <span className="universe-text">universe</span>
          </motion.h1>

          <motion.p
            className="galaxy-hero-subtitle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            I build high-performance systems and real-time interactive worlds.
          </motion.p>

          <motion.p
            className="galaxy-hero-role"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Software Engineer <span className="role-separator">•</span> Game Developer <span className="role-separator">•</span> Systems Programmer
          </motion.p>

          <motion.div
            className="galaxy-hero-social"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              href="https://github.com/AmjadAlthabteh"
              target="_blank"
              rel="noopener noreferrer"
              className="galaxy-social-link"
              aria-label="GitHub"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/amjad-althabteh/"
              target="_blank"
              rel="noopener noreferrer"
              className="galaxy-social-link"
              aria-label="LinkedIn"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </motion.div>

          <motion.div
            className="galaxy-hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              href="#projects"
              className="galaxy-btn galaxy-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="btn-glow"></span>
              <span className="btn-text">View Projects</span>
            </a>
            <a
              href="/assets/AmjadSAlthabtehResume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="galaxy-btn galaxy-btn-outline"
            >
              <span className="btn-text">Resume</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2, delay: 2 }}
      >
        <div className="scroll-line"></div>
        <span className="scroll-text">Scroll to explore</span>
      </motion.div>
    </section>
  );
};

export default GalaxyHero;
