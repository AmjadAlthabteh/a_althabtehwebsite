import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import './WelcomeBanner.css';

// Advanced particle system for space dust and atmosphere
const SpaceDust = () => {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 100;
      pos[i + 1] = (Math.random() - 0.5) * 100;
      pos[i + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

// Dynamic camera movement for cinematic intro
const CinematicCamera = () => {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Cinematic camera movement
    if (t < 3) {
      // Dolly in from far
      const progress = t / 3;
      camera.position.z = 25 - progress * 7;
      camera.position.y = 5 - progress * 2;
    } else if (t < 6) {
      // Follow rocket
      const rocketProgress = (t - 2.5) / 3;
      camera.position.x = -10 + rocketProgress * 10;
      camera.lookAt(-5 + rocketProgress * 5, 1 + Math.sin(rocketProgress * Math.PI) * 2, 0);
    } else {
      // Settle into final position with subtle movement
      const floatProgress = (t - 6) / 2;
      camera.position.x = Math.sin(floatProgress * 0.5) * 2;
      camera.position.y = 3 + Math.cos(floatProgress * 0.3) * 0.5;
      camera.lookAt(0, 0, -10);
    }
  });

  return null;
};

// Rocket exhaust particle system
const RocketExhaust = ({ position, active }: { position: THREE.Vector3; active: boolean }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = 0;
      pos[i + 1] = 0;
      pos[i + 2] = 0;
      vel[i] = (Math.random() - 0.5) * 0.2;
      vel[i + 1] = Math.random() * 0.5 + 0.5;
      vel[i + 2] = (Math.random() - 0.5) * 0.2;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!particlesRef.current || !active) return;

    const posAttr = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Update particle positions
      posAttr.array[i] += velocities[i];
      posAttr.array[i + 1] += velocities[i + 1];
      posAttr.array[i + 2] += velocities[i + 2];

      // Reset particle if it's too far
      if (posAttr.array[i + 1] > 3) {
        posAttr.array[i] = position.x + (Math.random() - 0.5) * 0.3;
        posAttr.array[i + 1] = position.y;
        posAttr.array[i + 2] = position.z + (Math.random() - 0.5) * 0.3;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ff6600"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

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

// Enhanced 3D Rocket Component with realistic materials
const Rocket = ({ targetPlanet }: { targetPlanet: [number, number, number] }) => {
  const rocketRef = useRef<THREE.Group>(null);
  const engineFlameRef = useRef<THREE.Group>(null);
  const [exhaustPosition, setExhaustPosition] = useState(new THREE.Vector3());
  const [isEngineActive, setIsEngineActive] = useState(true);

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

      // Update exhaust position
      const worldPos = new THREE.Vector3(
        rocketRef.current.position.x,
        rocketRef.current.position.y - 2,
        rocketRef.current.position.z
      );
      setExhaustPosition(worldPos);
    }

    // Engine flame flicker with more realism
    if (engineFlameRef.current) {
      const time = state.clock.getElapsedTime();
      const flicker = 1 + Math.sin(time * 20) * 0.15 + Math.sin(time * 35) * 0.1;
      engineFlameRef.current.scale.y = flicker;

      // Reduce flame when landing - adjusted timing
      if (time > 7) {
        const fadeOut = Math.max(0, 1 - (time - 7) / 0.5);
        engineFlameRef.current.scale.set(fadeOut, fadeOut * flicker, fadeOut);
        setIsEngineActive(fadeOut > 0.1);
      }
    }
  });

  return (
    <>
      <group ref={rocketRef} position={[-20, -2, 5]}>
        {/* Main body - cylinder with enhanced metallic material */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 3, 32]} />
          <meshStandardMaterial
            color="#f0f0f0"
            metalness={0.98}
            roughness={0.1}
            emissive="#444444"
            emissiveIntensity={0.15}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Nose cone with glossy finish */}
        <mesh position={[0, 2, 0]} castShadow>
          <coneGeometry args={[0.4, 1.2, 32]} />
          <meshStandardMaterial
            color="#ff3333"
            metalness={0.95}
            roughness={0.15}
            emissive="#ff0000"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Glowing windows */}
        <mesh position={[0, 0.8, 0.41]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={2}
            transparent
            opacity={0.98}
          />
        </mesh>

        {/* Side stripes with detail */}
        <mesh position={[0, 0, 0.41]} castShadow>
          <cylinderGeometry args={[0.35, 0.45, 2.8, 32]} />
          <meshStandardMaterial
            color="#2244aa"
            metalness={0.85}
            roughness={0.25}
            emissive="#1133aa"
            emissiveIntensity={0.2}
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
            castShadow
          >
            <boxGeometry args={[0.05, 1, 1]} />
            <meshStandardMaterial
              color="#888888"
              metalness={0.98}
              roughness={0.12}
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
            castShadow
          >
            <cylinderGeometry args={[0.15, 0.12, 0.4, 16]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.95}
              roughness={0.3}
              emissive="#ff3300"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* Enhanced engine flames with glow */}
        <group ref={engineFlameRef} position={[0, -2, 0]}>
          {/* Outer flame layer */}
          <mesh>
            <coneGeometry args={[0.7, 2.5, 16]} />
            <meshBasicMaterial
              color="#ff3300"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Main flame */}
          <mesh>
            <coneGeometry args={[0.6, 2, 16]} />
            <meshBasicMaterial
              color="#ff6600"
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Mid flame */}
          <mesh position={[0, -0.4, 0]}>
            <coneGeometry args={[0.45, 1.8, 16]} />
            <meshBasicMaterial
              color="#ff9900"
              transparent
              opacity={0.95}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Core flame */}
          <mesh position={[0, -0.6, 0]}>
            <coneGeometry args={[0.3, 1.5, 16]} />
            <meshBasicMaterial
              color="#ffff00"
              transparent
              opacity={1}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Engine glow - enhanced */}
          <pointLight
            color="#ff6600"
            intensity={12}
            distance={20}
            decay={2}
            position={[0, -1, 0]}
          />
          {/* Additional rim light */}
          <pointLight
            color="#ffaa00"
            intensity={8}
            distance={15}
            position={[0, -2, 0]}
          />
        </group>

        {/* Enhanced headlight */}
        <spotLight
          color="#ffffff"
          intensity={5}
          distance={25}
          angle={0.6}
          penumbra={0.6}
          position={[0, 2, 0]}
          target-position={[0, -10, 0]}
          castShadow
        />

        {/* Additional lights for realism */}
        <pointLight
          color="#00ffff"
          intensity={2}
          distance={8}
          position={[0, 0.8, 0]}
        />
      </group>

      {/* Rocket exhaust particles */}
      {isEngineActive && <RocketExhaust position={exhaustPosition} active={isEngineActive} />}
    </>
  );
};

// Enhanced 3D Planet Component with photorealistic details
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
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Create photorealistic planet textures with procedural noise
  const [planetTexture, normalMap] = useMemo(() => {
    const seed = Math.floor(position[0] * 100 + position[1] * 10 + position[2]);

    // Base color texture with more detail
    const texData = new Uint8Array(512 * 512 * 4);
    for (let i = 0; i < 512; i++) {
      for (let j = 0; j < 512; j++) {
        const idx = (i * 512 + j) * 4;
        const noise1 = Math.sin(i * 0.1 + seed) * Math.cos(j * 0.1 + seed);
        const noise2 = Math.sin(i * 0.05 + seed) * Math.cos(j * 0.05 + seed);
        const combined = (noise1 + noise2 * 0.5) * 128 + 128;

        texData[idx] = combined * 0.8;
        texData[idx + 1] = combined * 0.85;
        texData[idx + 2] = combined * 0.9;
        texData[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(texData, 512, 512, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

    // Normal map for surface detail
    const normalData = new Uint8Array(512 * 512 * 4);
    for (let i = 0; i < 512; i++) {
      for (let j = 0; j < 512; j++) {
        const idx = (i * 512 + j) * 4;
        const nx = Math.sin(i * 0.2 + seed) * 128 + 128;
        const ny = Math.cos(j * 0.2 + seed) * 128 + 128;
        normalData[idx] = nx;
        normalData[idx + 1] = ny;
        normalData[idx + 2] = 200;
        normalData[idx + 3] = 255;
      }
    }
    const norm = new THREE.DataTexture(normalData, 512, 512, THREE.RGBAFormat);
    norm.needsUpdate = true;
    norm.wrapS = norm.wrapT = THREE.RepeatWrapping;

    return [tex, norm];
  }, [position]);

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
    if (ringRef.current && hasRings) {
      ringRef.current.rotation.z += rotationSpeed * 0.5;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotationSpeed * 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Planet surface with enhanced materials */}
      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          color={color}
          emissive={emissive}
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Enhanced cloud layer */}
      {size > 1.5 && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[size + 0.08, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.25}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Multi-layered atmosphere glow */}
      <mesh scale={1.12}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={1.18}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Enhanced rings with multiple bands */}
      {hasRings && (
        <>
          <mesh ref={ringRef} rotation={[Math.PI / 2.3, 0, 0]} receiveShadow>
            <ringGeometry args={[size * 1.3, size * 2, 64]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              emissive={emissive}
              emissiveIntensity={0.15}
              roughness={0.8}
            />
          </mesh>
          {/* Secondary ring band */}
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[size * 2.1, size * 2.5, 64]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
              emissive={emissive}
              emissiveIntensity={0.08}
            />
          </mesh>
        </>
      )}

      {/* Animated target marker */}
      {isTarget && (
        <>
          <Sparkles
            count={30}
            scale={size * 2}
            size={3}
            speed={0.5}
            color="#00ff00"
          />
          <mesh position={[0, size + 0.6, 0]}>
            <coneGeometry args={[0.4, 0.8, 4]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          <pointLight
            color="#00ff00"
            intensity={5}
            distance={15}
            position={[0, size + 1, 0]}
          />
        </>
      )}

      {/* Enhanced planet lighting */}
      <pointLight
        color={emissive}
        intensity={3}
        distance={size * 10}
        decay={2}
      />

      {/* Rim light for more depth */}
      <spotLight
        color="#ffffff"
        intensity={1}
        distance={size * 15}
        angle={Math.PI / 6}
        penumbra={0.8}
        position={[size * 3, size * 2, size * 3]}
        target={planetRef.current || undefined}
      />
    </group>
  );
};


// Enhanced 3D Scene Component with photorealistic effects
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
        autoRotateSpeed={0.2}
      />

      {/* Cinematic camera movement */}
      <CinematicCamera />

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.3} color="#1a1a2e" />

      {/* Main sun light */}
      <directionalLight
        position={[20, 20, 15]}
        intensity={2}
        color="#fff5e1"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill lights for depth */}
      <directionalLight position={[-15, 10, -10]} intensity={1} color="#6688ff" />
      <directionalLight position={[10, -5, 10]} intensity={0.6} color="#ff8866" />

      {/* Rim light */}
      <pointLight position={[0, 15, -30]} intensity={1.5} color="#ffffff" distance={100} />

      {/* Volumetric lights */}
      <spotLight
        position={[-20, 20, -20]}
        angle={0.8}
        penumbra={0.9}
        intensity={2}
        color="#4a90e2"
        distance={100}
      />

      {/* Enhanced stars with multiple layers */}
      <Stars
        radius={200}
        depth={100}
        count={5000}
        factor={8}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Secondary star layer for depth */}
      <Stars
        radius={120}
        depth={60}
        count={2000}
        factor={4}
        saturation={0.2}
        fade
        speed={0.5}
      />

      {/* Space dust particles */}
      <SpaceDust />

      {/* Animated waypoint markers */}
      {waypoints.map((pos, i) => (
        <Waypoint
          key={i}
          position={pos}
          reached={time > i * 1.2 + 3}
        />
      ))}

      {/* Enhanced planets with photorealistic materials */}

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

      {/* Additional distant planets for depth */}
      <Planet
        position={[-25, 5, -40]}
        size={1.5}
        color="#5a3d8a"
        emissive="#9966cc"
        rotationSpeed={0.0006}
      />

      <Planet
        position={[30, -8, -50]}
        size={2}
        color="#4a7a9a"
        emissive="#6699cc"
        rotationSpeed={0.0007}
      />

      {/* Enhanced rocket with particle effects */}
      <Rocket targetPlanet={targetPlanet} />

      {/* Photorealistic nebula clouds */}
      <mesh position={[25, 15, -45]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial
          color="#ff00ff"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[-30, -12, -55]}>
        <sphereGeometry args={[25, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[15, -10, -60]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Distant galaxy effect */}
      <mesh position={[0, 0, -100]}>
        <sphereGeometry args={[40, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.03}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmospheric particle effects */}
      <Sparkles
        count={500}
        scale={100}
        size={2}
        speed={0.2}
        opacity={0.4}
        color="#ffffff"
      />
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
