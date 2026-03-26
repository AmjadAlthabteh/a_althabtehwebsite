import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
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

          // Add very subtle surface displacement for smooth appearance
          vec3 pos = position;
          float displacement = snoise(position * 2.5) * 0.015;
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

          // Calculate lighting with softer falloff
          float NdotL = dot(normal, uLightDirection);
          float lightIntensity = max(NdotL, 0.0);

          // Softer lighting with wrap-around effect
          float wrap = 0.5;
          float wrapDiffuse = max(0.0, (NdotL + wrap) / (1.0 + wrap));

          // Very smooth terminator line (day/night boundary)
          float terminator = smoothstep(-0.3, 0.4, NdotL);

          // Procedural surface detail with smooth variations
          vec3 surfacePos = vPosition * 1.8;
          float detail1 = snoise(surfacePos * 1.0 + uTime * 0.05) * 0.5 + 0.5;
          float detail2 = snoise(surfacePos * 2.0) * 0.5 + 0.5;
          float detail3 = snoise(surfacePos * 4.0) * 0.5 + 0.5;

          // Ultra-smooth surface detail blending
          float surfaceDetail = detail1 * 0.5 + detail2 * 0.35 + detail3 * 0.15;
          surfaceDetail = smoothstep(0.2, 0.8, surfaceDetail);

          // Create soft gradient colors - darker and lighter variants
          vec3 darkColor = uColor * 0.5;
          vec3 baseColor = uColor * 0.85;
          vec3 lightColor = uColor * 1.4;

          // Multi-gradient surface coloring
          vec3 surfaceColor = mix(darkColor, baseColor, surfaceDetail);
          surfaceColor = mix(surfaceColor, lightColor, surfaceDetail * surfaceDetail);

          // Enhanced Fresnel rim lighting for atmosphere
          float rimPower = 2.5;
          float rim = 1.0 - max(dot(viewDir, normal), 0.0);
          rim = pow(rim, rimPower);

          // Stronger rim on the lit side
          float litRim = rim * smoothstep(-0.5, 0.5, NdotL);
          vec3 rimColor = uAtmosphereColor * litRim * 2.0;

          // Soft subsurface scattering effect on terminator
          float subsurface = pow(max(0.0, -NdotL + 0.3), 2.0) * 0.4;
          vec3 subsurfaceColor = uEmissive * subsurface;

          // Combine lighting with softer transitions
          vec3 diffuse = surfaceColor * (wrapDiffuse * 0.9 + 0.1);
          vec3 ambient = surfaceColor * 0.25;

          // Softer emissive on night side
          vec3 nightGlow = uEmissive * 0.3 * pow(1.0 - terminator, 1.5);

          // Specular highlight (soft)
          vec3 halfDir = normalize(uLightDirection + viewDir);
          float specular = pow(max(dot(normal, halfDir), 0.0), 20.0) * (1.0 - uRoughness);
          vec3 specularColor = vec3(1.0) * specular * 0.5;

          vec3 finalColor = diffuse + ambient + nightGlow + rimColor + subsurfaceColor + specularColor;

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
              opacity={0.25}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>

          <mesh scale={1.12}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshBasicMaterial
              color={atmosphereColor || emissive}
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>

          <mesh scale={1.18}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshBasicMaterial
              color={atmosphereColor || emissive}
              transparent
              opacity={0.06}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Enhanced Ring System - Clear and Solid */}
      {hasRings && (
        <group rotation={[Math.PI / 2.8, 0.1, 0]}>
          {/* Main solid ring */}
          <mesh castShadow receiveShadow position={[0, 0, 0.001]}>
            <ringGeometry args={[size * 1.5, size * 2.5, 128]} />
            <meshStandardMaterial
              color={ringColor || color}
              transparent
              opacity={0.98}
              side={THREE.DoubleSide}
              roughness={0.7}
              metalness={0.1}
              emissive={ringColor || color}
              emissiveIntensity={0.3}
              depthWrite={true}
            />
          </mesh>

          {/* Secondary ring band (Cassini Division) with offset to prevent z-fighting */}
          <mesh castShadow receiveShadow position={[0, 0, 0.002]}>
            <ringGeometry args={[size * 2.6, size * 2.9, 128]} />
            <meshStandardMaterial
              color={ringColor || color}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              roughness={0.75}
              metalness={0.08}
              depthWrite={true}
            />
          </mesh>

          {/* Subtle inner glow for depth */}
          <mesh position={[0, 0, -0.001]}>
            <ringGeometry args={[size * 1.5, size * 2.9, 64]} />
            <meshBasicMaterial
              color={ringColor || color}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
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

// Detailed Spaceship/Rocket Component with Launch Sequence
function Spaceship({ launchPhase }: { launchPhase: 'countdown' | 'launch' | 'flying' }) {
  const shipRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const launchStartTime = useRef<number>(0);

  const particleCount = 100; // Optimized from 200 for performance
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

      if (launchPhase === 'countdown') {
        // Stationary on launchpad
        shipRef.current.position.set(0, -8, 5);
        shipRef.current.rotation.set(0, 0, 0);
      } else if (launchPhase === 'launch') {
        // Launch sequence - rocket shoots upward
        if (launchStartTime.current === 0) {
          launchStartTime.current = time;
        }
        const launchTime = time - launchStartTime.current;

        // Accelerating upward motion
        const acceleration = 2.5;
        const yPos = -8 + (launchTime * launchTime * acceleration);
        const zPos = 5 - launchTime * 3; // Move away from camera

        shipRef.current.position.set(0, yPos, zPos);
        shipRef.current.rotation.set(0, 0, Math.sin(launchTime * 2) * 0.05);

        // When rocket is high enough, switch to flying phase
        if (yPos > 20) {
          launchStartTime.current = 0;
        }
      } else {
        // Flying phase - normal gentle movement
        shipRef.current.position.x = Math.sin(time * 0.3) * 6 + 4;
        shipRef.current.position.y = Math.sin(time * 0.2) * 2 + 1;
        shipRef.current.position.z = -5;
        shipRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
        shipRef.current.rotation.y = Math.sin(time * 0.15) * 0.2 + Math.PI;
      }
    }

    if (engineGlowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.3 + 1.2;
      const intensityMultiplier = launchPhase === 'launch' ? 3 : 1;
      engineGlowRef.current.intensity = pulse * 3 * intensityMultiplier;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const particleSpeed = launchPhase === 'launch' ? 0.5 : 1;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 2] += particlePositions.velocities[i * 3 + 2] * particleSpeed;
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
    <group ref={shipRef}>
      {/* Main fuselage */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, 1.5, 16]} />
        <meshStandardMaterial
          color="#e8e8e8"
          metalness={0.92}
          roughness={0.15}
          emissive="#ffffff"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial
          color="#ff6666"
          metalness={0.75}
          roughness={0.25}
          emissive="#ff4444"
          emissiveIntensity={0.15}
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

      {/* Engine glow - brighter during launch */}
      <mesh position={[0, -1.15, 0]}>
        <sphereGeometry args={launchPhase === 'launch' ? [0.3, 16, 16] : [0.15, 16, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={launchPhase === 'launch' ? 1 : 0.9}
        />
      </mesh>

      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={launchPhase === 'launch' ? [0.5, 16, 16] : [0.25, 16, 16]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={launchPhase === 'launch' ? 0.8 : 0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Extra launch exhaust during takeoff */}
      {launchPhase === 'launch' && (
        <>
          <mesh position={[0, -1.5, 0]}>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial
              color="#ff8800"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, -2, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color="#ffaa33"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}

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
    const count = 10000; // Optimized from 25,000 for better performance
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
    const count = 7000; // Optimized star count for better performance
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Expanded star color palette with softer tones
    const starColors = [
      new THREE.Color('#b8d4ff'), // Soft blue
      new THREE.Color('#ffffff'), // Pure white
      new THREE.Color('#fff8f0'), // Warm white
      new THREE.Color('#fff4e0'), // Yellow-white
      new THREE.Color('#ffeecc'), // Pale yellow
      new THREE.Color('#ffd9aa'), // Soft yellow
      new THREE.Color('#ffbb88'), // Soft orange
      new THREE.Color('#ff9966'), // Orange
      new THREE.Color('#ff7755'), // Red-orange
      new THREE.Color('#ff6644'), // Red giant
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 25 + Math.random() * 60; // Wider distribution

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random star color
      const colorIndex = Math.floor(Math.random() * starColors.length);
      const starColor = starColors[colorIndex];
      colors[i3] = starColor.r;
      colors[i3 + 1] = starColor.g;
      colors[i3 + 2] = starColor.b;

      // More varied size distribution
      const sizeRoll = Math.random();
      if (sizeRoll > 0.98) {
        // Rare super giant stars (2%)
        sizes[i] = Math.random() * 0.2 + 0.15;
      } else if (sizeRoll > 0.93) {
        // Giant stars (5%)
        sizes[i] = Math.random() * 0.15 + 0.08;
      } else if (sizeRoll > 0.75) {
        // Medium stars (18%)
        sizes[i] = Math.random() * 0.09 + 0.04;
      } else {
        // Small stars (75%)
        sizes[i] = Math.random() * 0.05 + 0.015;
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

            // More varied, slower twinkle rates
            float twinkleSpeed = 0.5 + position.x * 0.3;
            float twinkle1 = sin(uTime * twinkleSpeed + position.y * 100.0) * 0.3;
            float twinkle2 = sin(uTime * twinkleSpeed * 1.7 + position.z * 50.0) * 0.2;
            float finalTwinkle = 0.7 + twinkle1 + twinkle2;

            gl_PointSize = size * finalTwinkle * 550.0 / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;

          void main() {
            float distanceToCenter = length(gl_PointCoord - vec2(0.5));
            float strength = 1.0 - distanceToCenter * 2.0;
            strength = max(strength, 0.0);

            // Enhanced soft bloom effect
            float bloom = pow(1.0 - distanceToCenter, 3.0) * 0.7;
            strength = strength + bloom;

            // Softer, more glowing appearance
            vec3 finalColor = vColor * (strength * 1.2 + 0.2);
            float alpha = strength * 0.9;

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

// Distant Background Stars (Parallax Layer)
function BackgroundStars() {
  const starsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 3000; // Optimized for performance
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 55 + Math.random() * 40;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Softer, more varied distant stars
      const brightness = 0.5 + Math.random() * 0.4;
      const colorVariation = Math.random();

      if (colorVariation > 0.7) {
        // Bluish stars
        colors[i3] = brightness * 0.85;
        colors[i3 + 1] = brightness * 0.92;
        colors[i3 + 2] = brightness;
      } else if (colorVariation > 0.4) {
        // White stars
        colors[i3] = brightness * 0.95;
        colors[i3 + 1] = brightness * 0.96;
        colors[i3 + 2] = brightness * 0.98;
      } else {
        // Warm stars
        colors[i3] = brightness;
        colors[i3 + 1] = brightness * 0.92;
        colors[i3 + 2] = brightness * 0.85;
      }

      sizes[i] = Math.random() * 0.04 + 0.015;
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
      {/* Large purple-pink nebula - softer colors */}
      <mesh position={[-18, 8, -35]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial
          color="#b888cc"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-18, 8, -35]} scale={0.7}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial
          color="#e8aaf8"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Blue-cyan nebula - softer */}
      <mesh position={[20, -6, -40]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#5577cc"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[20, -6, -40]} scale={0.6}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#7799ff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Red-orange nebula - softer */}
      <mesh position={[0, 12, -30]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial
          color="#ee6655"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 12, -30]} scale={0.8}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa66"
          transparent
          opacity={0.055}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Green-teal nebula - softer */}
      <mesh position={[-8, -10, -38]}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial
          color="#55aa88"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-8, -10, -38]} scale={0.7}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial
          color="#66ccb8"
          transparent
          opacity={0.045}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Magenta nebula - softer */}
      <mesh position={[12, 5, -28]}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial
          color="#dd77aa"
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Scattered smaller clouds - softer */}
      <mesh position={[-25, -3, -45]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial
          color="#8866bb"
          transparent
          opacity={0.055}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[15, -12, -42]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#ff9955"
          transparent
          opacity={0.065}
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

// Realistic Shooting Stars with Glowing Trails
function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null);

  // Define shooting star data structure
  interface ShootingStar {
    id: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    startTime: number;
    lifetime: number;
    color: THREE.Color;
    size: number;
    trailLength: number;
  }

  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const lastSpawnTime = useRef(0);

  // Color palette for realistic shooting stars
  const meteorColors = [
    new THREE.Color('#ffffff'), // White hot
    new THREE.Color('#fff8e7'), // Warm white
    new THREE.Color('#ffeaa7'), // Yellow
    new THREE.Color('#ffcc88'), // Orange-yellow
    new THREE.Color('#ff9966'), // Orange
    new THREE.Color('#88ccff'), // Blue (rare)
  ];

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Spawn new shooting stars randomly (every 2-5 seconds)
    if (time - lastSpawnTime.current > 2 + Math.random() * 3) {
      lastSpawnTime.current = time;

      // Spawn 1-2 shooting stars at a time
      const spawnCount = Math.random() > 0.7 ? 2 : 1;

      for (let i = 0; i < spawnCount; i++) {
        const newStar: ShootingStar = {
          id: Date.now() + i,
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 60 - 20, // Start from sides
            Math.random() * 30 + 10, // High in sky
            Math.random() * -30 - 20 // Background
          ),
          velocity: new THREE.Vector3(
            (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1), // Horizontal speed
            -(Math.random() * 1.5 + 0.5), // Downward speed
            Math.random() * 0.5 - 0.25 // Slight depth movement
          ),
          startTime: time,
          lifetime: 1.5 + Math.random() * 1.5, // 1.5-3 seconds lifetime
          color: meteorColors[Math.floor(Math.random() * meteorColors.length)],
          size: 0.08 + Math.random() * 0.12,
          trailLength: 3 + Math.random() * 4,
        };

        setShootingStars((prev) => [...prev, newStar]);
      }
    }

    // Update and remove expired shooting stars
    setShootingStars((prev) =>
      prev.filter((star) => time - star.startTime < star.lifetime)
    );
  });

  return (
    <group ref={groupRef}>
      {shootingStars.map((star) => {
        // Calculate fade based on lifetime
        const age = performance.now() / 1000 - star.startTime;
        const lifeProgress = age / star.lifetime;
        const opacity = lifeProgress < 0.2
          ? lifeProgress / 0.2 // Fade in
          : lifeProgress > 0.8
          ? (1 - lifeProgress) / 0.2 // Fade out
          : 1; // Full brightness

        // Current position with physics
        const currentPos = new THREE.Vector3(
          star.position.x + star.velocity.x * age,
          star.position.y + star.velocity.y * age - (age * age * 0.3), // Gravity effect
          star.position.z + star.velocity.z * age
        );

        return (
          <group key={star.id} position={currentPos}>
            {/* Main meteor head - bright and glowing */}
            <mesh>
              <sphereGeometry args={[star.size, 16, 16]} />
              <meshBasicMaterial
                color={star.color}
                transparent
                opacity={opacity}
              />
            </mesh>

            {/* Glowing halo around meteor */}
            <mesh scale={2}>
              <sphereGeometry args={[star.size, 16, 16]} />
              <meshBasicMaterial
                color={star.color}
                transparent
                opacity={opacity * 0.5}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Extended outer glow */}
            <mesh scale={3.5}>
              <sphereGeometry args={[star.size, 8, 8]} />
              <meshBasicMaterial
                color={star.color}
                transparent
                opacity={opacity * 0.2}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Trail streak - elongated in direction of motion */}
            <mesh
              position={[
                -star.velocity.x * 0.5,
                -star.velocity.y * 0.5,
                -star.velocity.z * 0.5
              ]}
              rotation={[
                0,
                0,
                Math.atan2(star.velocity.y, star.velocity.x)
              ]}
            >
              <cylinderGeometry args={[star.size * 0.3, star.size * 0.05, star.trailLength, 8]} />
              <meshBasicMaterial
                color={star.color}
                transparent
                opacity={opacity * 0.6}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Extended trail glow */}
            <mesh
              position={[
                -star.velocity.x * 0.8,
                -star.velocity.y * 0.8,
                -star.velocity.z * 0.8
              ]}
              rotation={[
                0,
                0,
                Math.atan2(star.velocity.y, star.velocity.x)
              ]}
            >
              <cylinderGeometry args={[star.size * 0.5, star.size * 0.02, star.trailLength * 1.5, 8]} />
              <meshBasicMaterial
                color={star.color}
                transparent
                opacity={opacity * 0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Point light from meteor */}
            <pointLight
              color={star.color}
              intensity={opacity * 2}
              distance={8}
              decay={2}
            />
          </group>
        );
      })}
    </group>
  );
}

// Foreground Sparkle Particles for Depth
function ForegroundSparkles() {
  const sparklesRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 150; // Optimized from 300 for performance
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Scattered around the camera
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 25 - 5;

      // Soft white sparkles
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i3] = brightness;
      colors[i3 + 1] = brightness * 0.98;
      colors[i3 + 2] = brightness * 0.95;

      sizes[i] = Math.random() * 0.02 + 0.01;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame((state) => {
    if (sparklesRef.current) {
      const material = sparklesRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={sparklesRef}>
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

            // Gentle sparkle effect
            float sparkle = sin(uTime * 2.0 + position.x * 100.0) * 0.3 + 0.7;
            gl_PointSize = size * sparkle * 600.0 / -mvPosition.z;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;

          void main() {
            float distanceToCenter = length(gl_PointCoord - vec2(0.5));
            float strength = 1.0 - distanceToCenter * 2.0;
            strength = max(strength, 0.0);

            // Soft sparkle appearance
            float bloom = pow(1.0 - distanceToCenter, 2.5) * 0.6;
            strength = strength + bloom;

            vec3 finalColor = vColor * (strength + 0.5);
            float alpha = strength * 0.7;

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

// Volumetric Light Rays from Sun
function LightRays() {
  const raysRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (raysRef.current) {
      raysRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={raysRef} position={[-25, 8, -20]}>
      {/* Create multiple light ray beams */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <mesh
          key={i}
          rotation={[0, 0, (angle * Math.PI) / 180]}
          position={[0, 0, 0]}
        >
          <planeGeometry args={[1, 80]} />
          <meshBasicMaterial
            color="#ffdd88"
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Additional subtle rays */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
        <mesh
          key={`sub-${i}`}
          rotation={[0, 0, (angle * Math.PI) / 180]}
          position={[0, 0, 0]}
        >
          <planeGeometry args={[0.6, 70]} />
          <meshBasicMaterial
            color="#ffe4aa"
            transparent
            opacity={0.025}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Cinematic Camera Movement with Launch Sequence
function CameraController({ launchPhase }: { launchPhase: 'countdown' | 'launch' | 'flying' }) {
  const launchStartTime = useRef<number>(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (launchPhase === 'countdown') {
      // Close-up on rocket on launchpad with slight camera movement
      const breathe = Math.sin(time * 0.5) * 0.1;
      state.camera.position.set(0, -6 + breathe, 12);
      state.camera.lookAt(0, -5, 5);
    } else if (launchPhase === 'launch') {
      // Follow rocket as it launches
      if (launchStartTime.current === 0) {
        launchStartTime.current = time;
      }
      const launchTime = time - launchStartTime.current;
      const acceleration = 2.5;
      const rocketY = -8 + (launchTime * launchTime * acceleration);

      // Camera shake during launch
      const shakeIntensity = Math.max(0, 1 - launchTime * 0.3);
      const shakeX = (Math.random() - 0.5) * 0.3 * shakeIntensity;
      const shakeY = (Math.random() - 0.5) * 0.3 * shakeIntensity;

      // Camera follows but lags behind slightly
      const cameraY = rocketY - 5;
      const cameraZ = 12 - launchTime * 2;

      state.camera.position.set(shakeX, cameraY + shakeY, cameraZ);
      state.camera.lookAt(0, rocketY, 5 - launchTime * 3);

      if (rocketY > 20) {
        launchStartTime.current = 0;
      }
    } else {
      // Normal cinematic drift
      const driftX = Math.sin(time * 0.018) * 1.0 + Math.cos(time * 0.012) * 0.5 + Math.sin(time * 0.025) * 0.3;
      const driftY = Math.cos(time * 0.015) * 0.7 + Math.sin(time * 0.008) * 0.4 + Math.cos(time * 0.022) * 0.25;
      const driftZ = Math.sin(time * 0.01) * 0.6 + Math.cos(time * 0.016) * 0.35;

      state.camera.position.x = driftX;
      state.camera.position.y = driftY;
      state.camera.position.z = 12 + driftZ;

      const lookAtX = Math.sin(time * 0.008) * 1.5 + Math.cos(time * 0.013) * 0.8;
      const lookAtY = Math.cos(time * 0.011) * 1.2 + Math.sin(time * 0.007) * 0.6;
      const lookAtZ = -10 + Math.sin(time * 0.009) * 0.5;

      state.camera.lookAt(lookAtX, lookAtY, lookAtZ);
      state.camera.rotation.z = Math.sin(time * 0.006) * 0.015;
    }
  });
  return null;
}

// Main 3D Scene with Cinematic Lighting
function Scene({ launchPhase }: { launchPhase: 'countdown' | 'launch' | 'flying' }) {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sunRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1;
      sunRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <CameraController launchPhase={launchPhase} />

      {/* === MAIN STAR/SUN - Bright Primary Light Source === */}
      <group position={[-25, 8, -20]}>
        {/* Sun core - ultra bright white */}
        <mesh ref={sunRef}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Intense inner corona */}
        <mesh scale={1.25}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#fffef8"
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Bright yellow glow layer */}
        <mesh scale={1.55}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#ffee99"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Warm orange glow */}
        <mesh scale={2.0}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#ffcc77"
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Mid orange halo */}
        <mesh scale={2.7}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#ffaa55"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Far orange glow */}
        <mesh scale={3.5}>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial
            color="#ff8833"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Extended soft halo */}
        <mesh scale={4.5}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial
            color="#ff7722"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Very far atmospheric glow */}
        <mesh scale={6.0}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial
            color="#ff6611"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Lens flare effect - horizontal */}
        <mesh rotation={[0, 0, 0]} scale={[12, 0.4, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#ffeeaa"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Lens flare effect - vertical */}
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[12, 0.4, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#ffeeaa"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Diagonal lens flare 1 */}
        <mesh rotation={[0, 0, Math.PI / 4]} scale={[10, 0.25, 0.25]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#ffdd99"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Diagonal lens flare 2 */}
        <mesh rotation={[0, 0, -Math.PI / 4]} scale={[10, 0.25, 0.25]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#ffdd99"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Strong directional light from sun */}
        <directionalLight
          position={[0, 0, 0]}
          intensity={6}
          color="#fffbf5"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* Very powerful sun point light */}
        <pointLight
          position={[0, 0, 0]}
          intensity={12}
          color="#fff8ed"
          distance={120}
          decay={1.6}
          castShadow
        />

        {/* Secondary fill light from sun */}
        <pointLight
          position={[2, 2, 2]}
          intensity={6}
          color="#ffe4c4"
          distance={80}
          decay={2}
        />
      </group>

      {/* Volumetric light rays from sun */}
      <LightRays />

      {/* Softer ambient base lighting */}
      <ambientLight intensity={0.08} color="#0f0f1f" />

      {/* Galaxy core light - softer */}
      <pointLight position={[0, -2, -15]} intensity={1.5} color="#ff6644" distance={45} decay={2} />

      {/* Accent lights for atmosphere - softer colors */}
      <pointLight position={[-15, 10, -10]} intensity={0.6} color="#5588ff" distance={50} decay={2} />
      <pointLight position={[15, -8, -12]} intensity={0.5} color="#8866ff" distance={45} decay={2} />

      {/* Rim lights for depth - softer */}
      <pointLight position={[0, 20, 8]} intensity={0.4} color="#7799ff" distance={65} decay={2} />
      <pointLight position={[0, -20, 8]} intensity={0.35} color="#ff6688" distance={65} decay={2} />

      {/* Soft fill lights from multiple directions */}
      <directionalLight position={[10, 5, 10]} intensity={0.15} color="#ffffff" />
      <directionalLight position={[-8, -5, 8]} intensity={0.1} color="#aaccff" />

      {/* Softer atmospheric fog with blue tint */}
      <fog attach="fog" args={['#000205', 25, 85]} />

      {/* === BACKGROUND LAYERS (Parallax) === */}
      <DistantGalaxies />
      <BackgroundStars />

      {/* Foreground sparkle particles for depth */}
      <ForegroundSparkles />

      {/* Main Star Field */}
      <StarField />

      {/* Realistic Shooting Stars */}
      <ShootingStars />

      {/* Nebula Clouds */}
      <NebulaClouds />

      {/* Central Spiral Galaxy */}
      <SpiralGalaxy />

      {/* === LAUNCHPAD === */}
      {launchPhase === 'countdown' && (
        <group position={[0, -9, 5]}>
          {/* Main platform */}
          <mesh>
            <cylinderGeometry args={[3, 3, 0.5, 32]} />
            <meshStandardMaterial
              color="#404040"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          {/* Support pillars */}
          {[0, 90, 180, 270].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 2.5,
                -2,
                Math.sin((angle * Math.PI) / 180) * 2.5,
              ]}
            >
              <cylinderGeometry args={[0.2, 0.3, 4, 16]} />
              <meshStandardMaterial
                color="#606060"
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
          ))}

          {/* Warning lights */}
          {[0, 90, 180, 270].map((angle, i) => (
            <pointLight
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 2.8,
                0.3,
                Math.sin((angle * Math.PI) / 180) * 2.8,
              ]}
              color="#ff3300"
              intensity={2}
              distance={5}
            />
          ))}
        </group>
      )}

      {/* === SPACESHIP === */}
      <Spaceship launchPhase={launchPhase} />

      {/* === PLANETS === */}
      {/* Saturn - Majestic ringed gas giant */}
      <Planet
        position={[-10, -2, -12]}
        size={2.0}
        color="#f5e8d0"
        emissive="#faf0e0"
        orbitRadius={14}
        orbitSpeed={0.04}
        rotationSpeed={0.003}
        hasRings={true}
        ringColor="#ffe4a0"
        atmosphereColor="#fdf5e8"
        roughness={0.55}
        metalness={0.08}
        hasAtmosphere={true}
      />

      {/* Neptune - Deep blue ice giant */}
      <Planet
        position={[8, 3, -8]}
        size={1.4}
        color="#5a8bc8"
        emissive="#7aa8dd"
        orbitRadius={10}
        orbitSpeed={0.07}
        rotationSpeed={0.005}
        hasRings={false}
        atmosphereColor="#a0c8f0"
        roughness={0.45}
        metalness={0.25}
        hasAtmosphere={true}
      />

      {/* Jupiter - Massive gas giant */}
      <Planet
        position={[12, -1, -15]}
        size={2.2}
        color="#d4a66a"
        emissive="#e8c090"
        orbitRadius={16}
        orbitSpeed={0.035}
        rotationSpeed={0.006}
        hasRings={false}
        atmosphereColor="#f5d8b0"
        roughness={0.55}
        metalness={0.12}
        hasAtmosphere={true}
      />

      {/* Mars - The red planet */}
      <Planet
        position={[-6, 2, -10]}
        size={0.9}
        color="#d86838"
        emissive="#f08855"
        orbitRadius={8}
        orbitSpeed={0.09}
        rotationSpeed={0.007}
        hasRings={false}
        atmosphereColor="#ffa87a"
        roughness={0.85}
        metalness={0.08}
        hasAtmosphere={true}
      />

      {/* Uranus - Tilted ice giant */}
      <Planet
        position={[5, -4, -18]}
        size={1.5}
        color="#78d8e8"
        emissive="#95e5f3"
        orbitRadius={12}
        orbitSpeed={0.055}
        rotationSpeed={0.004}
        hasRings={false}
        atmosphereColor="#b0f0fa"
        roughness={0.48}
        metalness={0.22}
        hasAtmosphere={true}
      />

      {/* Earth - Our home planet */}
      <Planet
        position={[-3, -3, -7]}
        size={1.0}
        color="#4a85cc"
        emissive="#6aa0e8"
        orbitRadius={6}
        orbitSpeed={0.08}
        rotationSpeed={0.008}
        hasRings={false}
        atmosphereColor="#88baf5"
        roughness={0.65}
        metalness={0.18}
        hasAtmosphere={true}
      />

      {/* Bloom Post-Processing for Beautiful Glow */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur={true}
        />
      </EffectComposer>
    </>
  );
}

// Main Hero Component
const GalaxyHero = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | string>('LOADING');
  const [launchPhase, setLaunchPhase] = useState<'countdown' | 'launch' | 'flying'>('countdown');
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    // Check if we've already shown the intro this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenRocketLaunch');

    if (hasSeenIntro) {
      // Skip the intro, go straight to content
      setIsLoading(false);
      setLaunchPhase('flying');
      setShowCountdown(false);
      return;
    }

    // Initial "LOADING" message
    if (countdown === 'LOADING') {
      const timer = setTimeout(() => {
        setCountdown(5);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Countdown timer
    if (typeof countdown === 'number' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Launch!
      setLaunchPhase('launch');
      setTimeout(() => {
        setShowCountdown(false);
      }, 1000);
      setTimeout(() => {
        setLaunchPhase('flying');
        // Hide loading screen and show main content
        setIsLoading(false);
        // Mark that we've seen the intro
        sessionStorage.setItem('hasSeenRocketLaunch', 'true');
      }, 4000); // Show launch for 4 seconds
    }
  }, [countdown]);

  return (
    <section id="home" className="galaxy-hero">
      {/* Full-Screen Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000000',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 3D Canvas for Loading Animation */}
            <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
              <Canvas
                camera={{ position: [0, 0, 12], fov: 60 }}
                shadows
                gl={{
                  antialias: true,
                  alpha: true,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.3,
                  outputColorSpace: THREE.SRGBColorSpace,
                }}
                dpr={[1, 2]}
              >
                <Scene launchPhase={launchPhase} />
              </Canvas>
            </div>

            {/* Countdown Text Overlay */}
            {showCountdown && (
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: countdown === 'LOADING' ? 1 : 0.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  fontSize: countdown === 0 ? '4rem' : countdown === 'LOADING' ? '3rem' : '8rem',
                  fontWeight: 'bold',
                  color: countdown === 0 ? '#ff6600' : countdown === 'LOADING' ? '#ffffff' : '#ffffff',
                  textShadow: countdown === 0
                    ? '0 0 30px rgba(255, 102, 0, 0.8), 0 0 60px rgba(255, 102, 0, 0.4)'
                    : '0 0 30px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.3)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: countdown === 'LOADING' ? '0.5rem' : '0',
                  zIndex: 10000,
                  pointerEvents: 'none',
                }}
              >
                {countdown === 0 ? 'LIFTOFF!' : countdown}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas Background - Main scene after loading */}
      {!isLoading && (
        <div className="galaxy-canvas-container">
          <Canvas
            camera={{ position: [0, 0, 12], fov: 60 }}
            shadows
            gl={{
              antialias: true,
              alpha: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.3,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            dpr={[1, 2]}
          >
            <Scene launchPhase={launchPhase} />
          </Canvas>
        </div>
      )}

      {/* Hero Content - Only show after loading completes */}
      {!isLoading && (
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
      )}

      {/* Scroll Indicator - Only show after loading completes */}
      {!isLoading && (
        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 2, delay: 3 }}
        >
          <div className="scroll-line"></div>
          <span className="scroll-text">Scroll to explore</span>
        </motion.div>
      )}
    </section>
  );
};

export default GalaxyHero;
