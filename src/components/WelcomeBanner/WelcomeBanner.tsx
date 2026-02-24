import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './WelcomeBanner.css';

// Waypoint marker component
const Waypoint = ({ position, reached }: { position: [number, number, number]; reached: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshBasicMaterial
          color={reached ? "#00ff00" : "#00ffff"}
          transparent
          opacity={reached ? 0.3 : 0.8}
        />
      </mesh>
      {!reached && (
        <pointLight color="#00ffff" intensity={2} distance={5} />
      )}
    </group>
  );
};

// 3D Rocket Component with landing capability
const Rocket = ({ targetPlanet }: { targetPlanet: [number, number, number] }) => {
  const rocketRef = useRef<THREE.Group>(null);
  const engineFlameRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (rocketRef.current) {
      const time = state.clock.getElapsedTime();

      // Flight path: start -> waypoints -> land on planet (SLOWED DOWN)
      if (time < 2.5) {
        // Phase 1: Launch from left - SLOWER (2.5 seconds)
        const t = time / 2.5;
        rocketRef.current.position.x = -20 + t * 15;
        rocketRef.current.position.y = -2 + t * 3;
        rocketRef.current.position.z = 5 - t * 5;
        rocketRef.current.rotation.z = 0.3;
      } else if (time < 5.5) {
        // Phase 2: Cruise through waypoints - SLOWER (3 seconds)
        const t = (time - 2.5) / 3;
        rocketRef.current.position.x = -5 + t * 5;
        rocketRef.current.position.y = 1 + Math.sin(t * Math.PI) * 2;
        rocketRef.current.position.z = 0 - t * 2;
        rocketRef.current.rotation.z = Math.sin(t * Math.PI * 2) * 0.1;
      } else {
        // Phase 3: Approach and land on target planet - SLOWER (2 seconds landing)
        const t = Math.min((time - 5.5) / 2, 1);
        const start = { x: 0, y: 3, z: -2 };
        const end = { x: targetPlanet[0], y: targetPlanet[1] + 3, z: targetPlanet[2] };

        rocketRef.current.position.x = start.x + (end.x - start.x) * t;
        rocketRef.current.position.y = start.y + (end.y - start.y) * t;
        rocketRef.current.position.z = start.z + (end.z - start.z) * t;

        // Rotate to landing position - smoother
        rocketRef.current.rotation.z = 0.3 * (1 - t);
        rocketRef.current.rotation.x = -Math.PI * t; // Flip to vertical landing
      }
    }

    // Engine flame flicker
    if (engineFlameRef.current) {
      const time = state.clock.getElapsedTime();
      engineFlameRef.current.scale.y = 1 + Math.sin(time * 20) * 0.2;

      // Reduce flame when landing - adjusted timing
      if (time > 7) {
        const fadeOut = Math.max(0, 1 - (time - 7) / 0.5);
        engineFlameRef.current.scale.set(fadeOut, fadeOut, fadeOut);
      }
    }
  });

  return (
    <group ref={rocketRef} position={[-20, -2, 5]}>
      {/* Main body - cylinder for realistic rocket */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 3, 32]} />
        <meshStandardMaterial
          color="#f0f0f0"
          metalness={0.95}
          roughness={0.15}
          emissive="#333333"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[0.4, 1.2, 32]} />
        <meshStandardMaterial
          color="#ff3333"
          metalness={0.9}
          roughness={0.2}
          emissive="#ff0000"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Windows */}
      <mesh position={[0, 0.8, 0.41]}>
        <circleGeometry args={[0.2, 32]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Side stripes */}
      <mesh position={[0, 0, 0.41]}>
        <cylinderGeometry args={[0.35, 0.45, 2.8, 32]} />
        <meshStandardMaterial
          color="#2244aa"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Fins - 4 large stabilizer fins */}
      {[0, 90, 180, 270].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((angle * Math.PI) / 180) * 0.5,
            -1.3,
            Math.cos((angle * Math.PI) / 180) * 0.5
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0]}
        >
          <boxGeometry args={[0.05, 1, 1]} />
          <meshStandardMaterial
            color="#888888"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>
      ))}

      {/* Engine nozzles - 3 main engines */}
      {[0, 120, 240].map((angle, i) => (
        <mesh
          key={`engine-${i}`}
          position={[
            Math.sin((angle * Math.PI) / 180) * 0.25,
            -1.7,
            Math.cos((angle * Math.PI) / 180) * 0.25
          ]}
        >
          <cylinderGeometry args={[0.15, 0.12, 0.4, 16]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Engine flames - improved */}
      <group ref={engineFlameRef} position={[0, -2, 0]}>
        {/* Main flame */}
        <mesh>
          <coneGeometry args={[0.6, 2, 16]} />
          <meshBasicMaterial
            color="#ff4400"
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Mid flame */}
        <mesh position={[0, -0.4, 0]}>
          <coneGeometry args={[0.45, 1.8, 16]} />
          <meshBasicMaterial
            color="#ff8800"
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Core flame */}
        <mesh position={[0, -0.6, 0]}>
          <coneGeometry args={[0.3, 1.5, 16]} />
          <meshBasicMaterial
            color="#ffff00"
            transparent
            opacity={0.95}
          />
        </mesh>
        {/* Engine glow */}
        <pointLight
          color="#ff6600"
          intensity={8}
          distance={15}
          position={[0, -1, 0]}
        />
      </group>

      {/* Headlight */}
      <spotLight
        color="#ffffff"
        intensity={3}
        distance={20}
        angle={0.5}
        penumbra={0.5}
        position={[0, 2, 0]}
        target-position={[0, -10, 0]}
      />
    </group>
  );
};

// 3D Planet Component with realistic details
const Planet = ({
  position,
  size,
  color,
  emissive,
  rotationSpeed = 0.002,
  hasRings = false,
  isTarget = false
}: {
  position: [number, number, number];
  size: number;
  color: string;
  emissive: string;
  rotationSpeed?: number;
  hasRings?: boolean;
  isTarget?: boolean;
}) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
    if (ringRef.current && hasRings) {
      ringRef.current.rotation.z += rotationSpeed * 0.5;
    }
  });

  // Create a more detailed planet surface
  const planetTexture = new THREE.DataTexture(
    new Uint8Array(256 * 256 * 4).map(() => Math.random() * 255),
    256,
    256,
    THREE.RGBAFormat
  );
  planetTexture.needsUpdate = true;

  return (
    <group position={position}>
      {/* Planet surface with detail */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.15}
          roughness={0.8}
          metalness={0.05}
          bumpMap={planetTexture}
          bumpScale={0.1}
        />
      </mesh>

      {/* Cloud layer for some planets */}
      {size > 1.5 && (
        <mesh>
          <sphereGeometry args={[size + 0.05, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            roughness={1}
          />
        </mesh>
      )}

      {/* Atmosphere glow - larger and more visible */}
      <mesh scale={1.15}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Rings for gas giants */}
      {hasRings && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[size * 1.3, size * 2, 64]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            emissive={emissive}
            emissiveIntensity={0.1}
          />
        </mesh>
      )}

      {/* Target marker if this is the landing planet */}
      {isTarget && (
        <>
          <mesh position={[0, size + 0.5, 0]}>
            <coneGeometry args={[0.3, 0.6, 4]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          <pointLight
            color="#00ff00"
            intensity={3}
            distance={10}
            position={[0, size + 1, 0]}
          />
        </>
      )}

      {/* Planet ambient light */}
      <pointLight
        color={emissive}
        intensity={2}
        distance={size * 8}
      />
    </group>
  );
};

// 3D Scene Component
const SpaceScene = () => {
  const [time, setTime] = useState(0);

  useFrame((state) => {
    setTime(state.clock.getElapsedTime());
  });

  const targetPlanet: [number, number, number] = [8, -1, -15];

  // Waypoint positions along flight path
  const waypoints: [number, number, number][] = [
    [-10, 0, 2],
    [-3, 2, -2],
    [2, 2, -6],
  ];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 18]} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3}
      />

      {/* Lighting - enhanced */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[15, 15, 10]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.8} color="#6688ff" />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" />

      {/* Stars - more realistic */}
      <Stars
        radius={150}
        depth={80}
        count={8000}
        factor={6}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Waypoint markers along flight path */}
      {waypoints.map((pos, i) => (
        <Waypoint
          key={i}
          position={pos}
          reached={time > i * 1.2 + 3}
        />
      ))}

      {/* Planets - properly spaced in 3D space */}

      {/* Planet 1: Blue Earth-like (close, left) */}
      <Planet
        position={[-12, 1, -8]}
        size={2.2}
        color="#2a5a8a"
        emissive="#4a90e2"
        rotationSpeed={0.001}
      />

      {/* Planet 2: Red Mars-like (middle distance) */}
      <Planet
        position={[5, 3, -10]}
        size={1.8}
        color="#c1440e"
        emissive="#ff5722"
        rotationSpeed={0.0012}
      />

      {/* Planet 3: Gas Giant with rings (far right) */}
      <Planet
        position={[15, -2, -20]}
        size={3.5}
        color="#d4a574"
        emissive="#e8b887"
        rotationSpeed={0.0005}
        hasRings={true}
      />

      {/* Planet 4: Purple/violet planet (background) */}
      <Planet
        position={[-8, -4, -25]}
        size={2.5}
        color="#6a4c93"
        emissive="#8b6bb7"
        rotationSpeed={0.0008}
      />

      {/* Planet 5: Target landing planet - Green (center-ish) */}
      <Planet
        position={targetPlanet}
        size={2.8}
        color="#2d5a3d"
        emissive="#4ae290"
        rotationSpeed={0.001}
        isTarget={true}
      />

      {/* Planet 6: Small orange moon (near target) */}
      <Planet
        position={[12, 1, -12]}
        size={1.2}
        color="#ff8c42"
        emissive="#ffa562"
        rotationSpeed={0.002}
      />

      {/* Rocket with target */}
      <Rocket targetPlanet={targetPlanet} />

      {/* Nebula effect in background */}
      <mesh position={[20, 10, -40]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial
          color="#ff00ff"
          transparent
          opacity={0.05}
        />
      </mesh>
      <mesh position={[-25, -8, -50]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.04}
        />
      </mesh>
    </>
  );
};

const WelcomeBanner = () => {
  const [hide, setHide] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation - SLOWER
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 60);

    // Hide banner after animation - LONGER (8 seconds total)
    const timer = setTimeout(() => {
      setHide(true);
    }, 8000);

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
