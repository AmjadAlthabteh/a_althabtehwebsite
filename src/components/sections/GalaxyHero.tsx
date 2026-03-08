import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import './GalaxyHero.css';

// Procedural noise function for planet surface detail
const noise3D = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// Enhanced Realistic Planet Component with Surface Textures
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
  const materialRef = useRef<THREE.ShaderMaterial>(null);

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
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Planet surface shader with procedural textures
  const planetShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uEmissive: { value: new THREE.Color(emissive) },
        uAtmosphereColor: { value: new THREE.Color(atmosphereColor || emissive) },
        uLightDirection: { value: new THREE.Vector3(-1, 0.2, 0.5).normalize() },
        uRoughness: { value: roughness },
        uMetalness: { value: metalness },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        ${noise3D}

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;

          // Add subtle surface displacement
          vec3 pos = position;
          float displacement = snoise(position * 3.0) * 0.02;
          pos += normal * displacement;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uEmissive;
        uniform vec3 uAtmosphereColor;
        uniform vec3 uLightDirection;
        uniform float uTime;
        uniform float uRoughness;
        uniform float uMetalness;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        ${noise3D}

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);

          // Calculate lighting
          float NdotL = dot(normal, uLightDirection);
          float lightIntensity = max(NdotL, 0.0);

          // Terminator line (day/night boundary)
          float terminator = smoothstep(-0.1, 0.1, NdotL);

          // Procedural surface detail (craters, continents, storms)
          vec3 surfacePos = vPosition * 2.0;
          float detail1 = snoise(surfacePos * 1.5 + uTime * 0.05) * 0.5 + 0.5;
          float detail2 = snoise(surfacePos * 3.0) * 0.5 + 0.5;
          float detail3 = snoise(surfacePos * 8.0) * 0.5 + 0.5;

          // Combine details for surface variation
          float surfaceDetail = detail1 * 0.6 + detail2 * 0.3 + detail3 * 0.1;
          vec3 surfaceColor = mix(uColor * 0.7, uColor * 1.3, surfaceDetail);

          // Rim lighting (Fresnel effect)
          float rimPower = 3.0;
          float rim = 1.0 - max(dot(viewDir, normal), 0.0);
          rim = pow(rim, rimPower);
          vec3 rimColor = uAtmosphereColor * rim * 1.5;

          // Combine lighting
          vec3 diffuse = surfaceColor * lightIntensity;
          vec3 ambient = surfaceColor * 0.15;
          vec3 emissive = uEmissive * 0.2 * (1.0 - terminator);

          // Dark side glow (emissive on night side)
          vec3 nightGlow = uEmissive * 0.4 * (1.0 - terminator);

          vec3 finalColor = diffuse + ambient + emissive + nightGlow + rimColor;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    };
  }, [color, emissive, atmosphereColor, roughness, metalness]);

  return (
    <group ref={planetRef} position={position}>
      {/* Main Planet Body with Realistic Shader */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[size, 128, 128]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={planetShader.uniforms}
          vertexShader={planetShader.vertexShader}
          fragmentShader={planetShader.fragmentShader}
        />
      </mesh>

      {/* Enhanced Atmosphere with Scattering */}
      {hasAtmosphere && (
        <>
          <mesh scale={1.05}>
            <sphereGeometry args={[size, 64, 64]} />
            <meshBasicMaterial
              color={atmosphereColor || emissive}
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          <mesh scale={1.12}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshBasicMaterial
              color={atmosphereColor || emissive}
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          <mesh scale={1.2}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshBasicMaterial
              color={atmosphereColor || emissive}
              transparent
              opacity={0.05}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}

      {/* Realistic Ring System with Shadows */}
      {hasRings && (
        <group rotation={[Math.PI / 2.8, 0.1, 0]}>
          {/* Main ring with texture */}
          <mesh castShadow receiveShadow>
            <ringGeometry args={[size * 1.5, size * 2.5, 128]} />
            <meshStandardMaterial
              color={ringColor || color}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
              roughness={0.9}
              metalness={0.05}
              emissive={ringColor || color}
              emissiveIntensity={0.15}
            />
          </mesh>

          {/* Secondary ring (Cassini Division) */}
          <mesh castShadow receiveShadow>
            <ringGeometry args={[size * 2.6, size * 2.9, 128]} />
            <meshStandardMaterial
              color={ringColor || color}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
              roughness={0.95}
              metalness={0.02}
            />
          </mesh>

          {/* Ring glow */}
          <mesh>
            <ringGeometry args={[size * 1.5, size * 2.9, 64]} />
            <meshBasicMaterial
              color={ringColor || color}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* Subtle point light from planet */}
      <pointLight
        color={emissive}
        intensity={0.4}
        distance={size * 8}
        decay={2}
      />
    </group>
  );
}

// Detailed Spaceship/Rocket Component
function Spaceship() {
  const shipRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 200;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = Math.random() * 3;
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = Math.random() * 0.1 + 0.05;
    }
    return { positions, velocities };
  }, []);

  useFrame((state) => {
    if (shipRef.current) {
      const time = state.clock.elapsedTime;
      shipRef.current.position.x = Math.sin(time * 0.3) * 6;
      shipRef.current.position.y = Math.sin(time * 0.2) * 2 + 1;
      shipRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
      shipRef.current.rotation.y = Math.sin(time * 0.15) * 0.2 + Math.PI;
    }

    if (engineGlowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.3 + 1.2;
      engineGlowRef.current.intensity = pulse * 3;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 2] += particlePositions.velocities[i * 3 + 2];
        if (positions[i * 3 + 2] > 3) {
          positions[i * 3] = (Math.random() - 0.5) * 0.2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
          positions[i * 3 + 2] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={shipRef} position={[4, 1, -5]}>
      {/* Main fuselage */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, 1.5, 16]} />
        <meshStandardMaterial
          color="#d0d0d0"
          metalness={0.9}
          roughness={0.2}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial
          color="#ff4444"
          metalness={0.8}
          roughness={0.3}
          emissive="#ff2222"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Fins */}
      {[0, 90, 180, 270].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((angle * Math.PI) / 180) * 0.25,
            -0.6,
            Math.cos((angle * Math.PI) / 180) * 0.25,
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial
            color="#909090"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Metallic panel lines */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.16, 0.01, 8, 32]} />
        <meshStandardMaterial color="#606060" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.18, 0.01, 8, 32]} />
        <meshStandardMaterial color="#606060" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Engine nozzle */}
      <mesh position={[0, -0.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.12, 0.3, 16]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.95}
          roughness={0.4}
        />
      </mesh>

      {/* Engine glow */}
      <mesh position={[0, -1.15, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Thruster particles */}
      <points ref={particlesRef} position={[0, -1.1, 0]}>
        <bufferGeometry>
          <bufferAttribute
            args={[particlePositions.positions, 3]}
            attach="attributes-position"
            count={particleCount}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#ffaa33"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Engine point light */}
      <pointLight
        ref={engineGlowRef}
        position={[0, -1.2, 0]}
        color="#ff5500"
        intensity={3}
        distance={8}
        decay={2}
        castShadow
      />

      {/* Cockpit windows */}
      <mesh position={[0, 0.6, 0.16]}>
        <boxGeometry args={[0.1, 0.15, 0.02]} />
        <meshStandardMaterial
          color="#00aaff"
          metalness={0.1}
          roughness={0.1}
          emissive="#0088cc"
          emissiveIntensity={0.8}
        />
      </mesh>
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

// Enhanced Multi-Layered Star Field with Color Variation
function StarField() {
  const starsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Star color palette (blue, red, white, yellow/orange)
    const starColors = [
      new THREE.Color('#aaccff'), // Blue giant
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#fff4e0'), // Yellow-white
      new THREE.Color('#ffddaa'), // Yellow
      new THREE.Color('#ffaa66'), // Orange
      new THREE.Color('#ff6644'), // Red giant
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 30 + Math.random() * 50;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random star color
      const colorIndex = Math.floor(Math.random() * starColors.length);
      const starColor = starColors[colorIndex];
      colors[i3] = starColor.r;
      colors[i3 + 1] = starColor.g;
      colors[i3 + 2] = starColor.b;

      // Varied sizes - some stars are much larger
      const sizeRoll = Math.random();
      if (sizeRoll > 0.95) {
        // Giant stars (5%)
        sizes[i] = Math.random() * 0.15 + 0.1;
      } else if (sizeRoll > 0.8) {
        // Medium stars (15%)
        sizes[i] = Math.random() * 0.08 + 0.05;
      } else {
        // Small stars (80%)
        sizes[i] = Math.random() * 0.04 + 0.02;
      }
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

            // Different twinkle rates based on position
            float twinkle = sin(uTime * (1.0 + position.x * 0.5) + position.y * 10.0) * 0.4 + 0.8;
            gl_PointSize = size * twinkle * 500.0 / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;

          void main() {
            float distanceToCenter = length(gl_PointCoord - vec2(0.5));
            float strength = 1.0 - distanceToCenter * 2.0;
            strength = max(strength, 0.0);

            // Add star bloom effect
            float bloom = pow(1.0 - distanceToCenter, 4.0) * 0.5;
            strength = strength + bloom;

            vec3 finalColor = vColor * (strength + 0.3);
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

// Distant Background Stars (Parallax Layer)
function BackgroundStars() {
  const starsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 60 + Math.random() * 30;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Dimmer, bluish-white distant stars
      const brightness = 0.4 + Math.random() * 0.3;
      colors[i3] = brightness * 0.9;
      colors[i3 + 1] = brightness * 0.95;
      colors[i3 + 2] = brightness;

      sizes[i] = Math.random() * 0.03 + 0.01;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
      starsRef.current.rotation.x = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" count={positions.length / 3} />
        <bufferAttribute args={[colors, 3]} attach="attributes-color" count={colors.length / 3} />
        <bufferAttribute args={[sizes, 1]} attach="attributes-size" count={sizes.length} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.02}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// Enhanced Volumetric Nebula Clouds with Realistic Colors
function NebulaClouds() {
  const nebulaGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (nebulaGroup.current) {
      nebulaGroup.current.rotation.y = state.clock.elapsedTime * 0.008;
      nebulaGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.002) * 0.05;
    }
  });

  return (
    <group ref={nebulaGroup}>
      {/* Large purple-pink nebula */}
      <mesh position={[-18, 8, -35]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial
          color="#8b3a9c"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-18, 8, -35]} scale={0.7}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial
          color="#d946ef"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Blue-cyan nebula */}
      <mesh position={[20, -6, -40]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#1e40af"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[20, -6, -40]} scale={0.6}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Red-orange nebula */}
      <mesh position={[0, 12, -30]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial
          color="#dc2626"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 12, -30]} scale={0.8}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial
          color="#f97316"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Green-teal nebula */}
      <mesh position={[-8, -10, -38]}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial
          color="#047857"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-8, -10, -38]} scale={0.7}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial
          color="#14b8a6"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Magenta nebula */}
      <mesh position={[12, 5, -28]}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial
          color="#be185d"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Scattered smaller clouds */}
      <mesh position={[-25, -3, -45]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial
          color="#4c1d95"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[15, -12, -42]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#ea580c"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Distant Galaxies
function DistantGalaxies() {
  const galaxiesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (galaxiesRef.current) {
      galaxiesRef.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  const galaxyPositions = useMemo(() => [
    { pos: [-35, 15, -60], size: 4, color: '#8b5cf6', rotation: Math.PI / 4 },
    { pos: [40, -10, -65], size: 5, color: '#3b82f6', rotation: Math.PI / 3 },
    { pos: [25, 20, -70], size: 3, color: '#ec4899', rotation: Math.PI / 6 },
    { pos: [-30, -18, -68], size: 4.5, color: '#f59e0b', rotation: Math.PI / 5 },
    { pos: [0, -25, -75], size: 3.5, color: '#6366f1', rotation: Math.PI / 2.5 },
  ], []);

  return (
    <group ref={galaxiesRef}>
      {galaxyPositions.map((galaxy, i) => (
        <group key={i} position={galaxy.pos as [number, number, number]} rotation={[0, 0, galaxy.rotation]}>
          {/* Galaxy core */}
          <mesh>
            <sphereGeometry args={[galaxy.size * 0.3, 16, 16]} />
            <meshBasicMaterial
              color={galaxy.color}
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Galaxy disk */}
          <mesh>
            <circleGeometry args={[galaxy.size, 32]} />
            <meshBasicMaterial
              color={galaxy.color}
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Galaxy glow */}
          <mesh scale={1.5}>
            <circleGeometry args={[galaxy.size, 32]} />
            <meshBasicMaterial
              color={galaxy.color}
              transparent
              opacity={0.05}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
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

// Main 3D Scene with Cinematic Lighting
function Scene() {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sunRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1;
      sunRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <CameraController />

      {/* === MAIN STAR/SUN - Primary Light Source === */}
      <group position={[-25, 8, -20]}>
        {/* Sun sphere */}
        <mesh ref={sunRef}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial color="#ffdd88" />
        </mesh>

        {/* Sun glow layers */}
        <mesh scale={1.3}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial
            color="#ffaa44"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh scale={1.6}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial
            color="#ff8833"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Main directional light from sun */}
        <directionalLight
          position={[0, 0, 0]}
          intensity={2.5}
          color="#fff4e0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* Sun point light */}
        <pointLight
          position={[0, 0, 0]}
          intensity={4}
          color="#ffcc66"
          distance={80}
          decay={2}
          castShadow
        />
      </group>

      {/* Ambient base lighting */}
      <ambientLight intensity={0.05} color="#0a0a1a" />

      {/* Galaxy core light */}
      <pointLight position={[0, -2, -15]} intensity={1.8} color="#ff5533" distance={40} decay={2} />

      {/* Accent lights for atmosphere */}
      <pointLight position={[-15, 10, -10]} intensity={0.8} color="#3377ff" distance={45} decay={2} />
      <pointLight position={[15, -8, -12]} intensity={0.6} color="#7744ff" distance={40} decay={2} />

      {/* Rim lights for depth */}
      <pointLight position={[0, 20, 8]} intensity={0.5} color="#6688ff" distance={60} decay={2} />
      <pointLight position={[0, -20, 8]} intensity={0.4} color="#ff4466" distance={60} decay={2} />

      {/* Fill light */}
      <directionalLight position={[10, 5, 10]} intensity={0.2} color="#ffffff" />

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#000000', 20, 80]} />

      {/* === BACKGROUND LAYERS (Parallax) === */}
      <DistantGalaxies />
      <BackgroundStars />

      {/* Main Star Field */}
      <StarField />

      {/* Nebula Clouds */}
      <NebulaClouds />

      {/* Central Spiral Galaxy */}
      <SpiralGalaxy />

      {/* === SPACESHIP === */}
      <Spaceship />

      {/* === PLANETS === */}
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

      {/* Earth - Our home planet */}
      <Planet
        position={[-3, -3, -7]}
        size={1.0}
        color="#1a5fb4"
        emissive="#3584e4"
        orbitRadius={6}
        orbitSpeed={0.08}
        rotationSpeed={0.008}
        hasRings={false}
        atmosphereColor="#62a0ea"
        roughness={0.7}
        metalness={0.2}
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
          shadows
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.5,
            outputColorSpace: THREE.SRGBColorSpace,
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
