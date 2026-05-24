import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useTheme } from "../../context/ThemeContext";
import "./PlanetariumBackground.css";

type InputState = {
  mouseX: number;
  mouseY: number;
  scroll: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const hash01 = (n: number) => {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

const valueNoise2D = (x: number, y: number, salt: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const hash = (ix: number, iy: number) => hash01(ix * 374761393 + iy * 668265263 + salt * 1442695041);

  const v00 = hash(xi, yi);
  const v10 = hash(xi + 1, yi);
  const v01 = hash(xi, yi + 1);
  const v11 = hash(xi + 1, yi + 1);

  const u = smoothstep(xf);
  const v = smoothstep(yf);
  const a = v00 * (1 - u) + v10 * u;
  const b = v01 * (1 - u) + v11 * u;
  return a * (1 - v) + b * v;
};

const fbm2D = (x: number, y: number, salt: number, octaves = 5) => {
  let amp = 0.55;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq, salt + i * 1013);
    norm += amp;
    freq *= 2.0;
    amp *= 0.55;
  }
  return sum / norm;
};

const makeCanvasTexture = (size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
};

const makeDataTexture = (size: number, fill: (data: Uint8Array, size: number) => void, noColorSpace = true) => {
  const data = new Uint8Array(size * size * 4);
  fill(data, size);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = noColorSpace ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
};

const generatePlanetTextures = (seed: number, kind: "rocky" | "gas" | "ice", theme: "light" | "dark") => {
  const rand = mulberry32(seed);
  const saltBase = (seed ^ 0x9e3779b9) | 0;
  const o1 = rand() * 10;
  const o2 = rand() * 10;
  const o3 = rand() * 10;

  // Keep textures modest for smooth FPS on mid-tier GPUs/laptops.
  const colorSize = 256;
  const bumpSize = 128;

  const colorMap = makeCanvasTexture(colorSize, (ctx, size) => {
    const img = ctx.createImageData(size, size);
    const d = img.data;

    const ocean = theme === "dark" ? [8, 22, 38] : [40, 90, 150];
    const landA = theme === "dark" ? [55, 120, 110] : [70, 150, 120];
    const landB = theme === "dark" ? [125, 95, 70] : [170, 130, 90];
    const iceA = theme === "dark" ? [170, 210, 235] : [215, 245, 255];
    const gasA = theme === "dark" ? [195, 140, 85] : [240, 180, 120];
    const gasB = theme === "dark" ? [90, 125, 165] : [120, 155, 195];

    for (let y = 0; y < size; y++) {
      const v = y / (size - 1);
      for (let x = 0; x < size; x++) {
        const u = x / (size - 1);
        const nx = (u - 0.5) * 2;
        const ny = (v - 0.5) * 2;
        const r2 = nx * nx + ny * ny;
        const idx = (y * size + x) * 4;

        if (r2 > 1) {
          d[idx + 3] = 0;
          continue;
        }

        const lat = Math.asin(ny);
        const lon = Math.atan2(nx, Math.sqrt(1 - r2));

        const n = fbm2D(lon * 1.2 + 10.0 + o1, lat * 1.2 - 3.0 + o2, saltBase + 11, 6);
        const n2 = fbm2D(lon * 2.8 - 2.0 - o3, lat * 2.6 + 7.0 + o1, saltBase + 97, 4);

        let col: number[];
        if (kind === "gas") {
          const bands = 0.5 + 0.5 * Math.sin(lat * 14 + n2 * 6);
          const t = clamp01(0.25 + 0.75 * bands);
          col = [
            gasA[0] * t + gasB[0] * (1 - t),
            gasA[1] * t + gasB[1] * (1 - t),
            gasA[2] * t + gasB[2] * (1 - t)
          ];
          const storm = Math.exp(-Math.pow((nx - 0.18) * 3.2, 2) - Math.pow((ny + 0.05) * 3.2, 2));
          col[0] = col[0] + storm * 60;
          col[1] = col[1] + storm * 20;
          col[2] = col[2] + storm * 10;
        } else if (kind === "ice") {
          const t = clamp01(0.25 + 0.9 * n);
          col = [
            iceA[0] * t + 30 * (1 - t),
            iceA[1] * t + 45 * (1 - t),
            iceA[2] * t + 70 * (1 - t)
          ];
          const cracks = Math.pow(clamp01(1 - Math.abs(n2 - 0.5) * 3), 4);
          col[0] += cracks * 25;
          col[1] += cracks * 30;
          col[2] += cracks * 40;
        } else {
          const landMask = smoothstep(clamp01((n - 0.48) * 2.4));
          col = [
            ocean[0] * (1 - landMask) + (landA[0] * (1 - n2) + landB[0] * n2) * landMask,
            ocean[1] * (1 - landMask) + (landA[1] * (1 - n2) + landB[1] * n2) * landMask,
            ocean[2] * (1 - landMask) + (landA[2] * (1 - n2) + landB[2] * n2) * landMask
          ];
          const polar = Math.pow(clamp01(Math.abs(ny)), 4);
          col[0] = col[0] * (1 - polar) + iceA[0] * polar;
          col[1] = col[1] * (1 - polar) + iceA[1] * polar;
          col[2] = col[2] * (1 - polar) + iceA[2] * polar;
        }

        const limb = Math.pow(clamp01(1 - r2), 0.35);
        const shade = 0.58 + 0.42 * limb;
        d[idx] = clamp01((col[0] / 255) * shade) * 255;
        d[idx + 1] = clamp01((col[1] / 255) * shade) * 255;
        d[idx + 2] = clamp01((col[2] / 255) * shade) * 255;
        d[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(size * 0.35, size * 0.35, size * 0.06, size * 0.35, size * 0.35, size * 0.6);
    glow.addColorStop(0, "rgba(255,255,255,0.12)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "source-over";
  });

  const bumpMap = makeDataTexture(bumpSize, (data, size) => {
    for (let y = 0; y < size; y++) {
      const v = y / (size - 1);
      for (let x = 0; x < size; x++) {
        const u = x / (size - 1);
        const nx = (u - 0.5) * 2;
        const ny = (v - 0.5) * 2;
        const r2 = nx * nx + ny * ny;
        const idx = (y * size + x) * 4;

        if (r2 > 1) {
          data[idx + 3] = 0;
          continue;
        }

        const lat = Math.asin(ny);
        const lon = Math.atan2(nx, Math.sqrt(1 - r2));

        let h = fbm2D(lon * 1.7 + 4.0 + o2, lat * 1.7 + 3.0 + o3, saltBase + 7, 5);
        if (kind === "gas") h = fbm2D(lon * 0.8 + o1, lat * 4.0 + o2, saltBase + 31, 4);
        if (kind === "ice") h = fbm2D(lon * 2.6 - 7.0 - o2, lat * 2.6 + 1.0 + o1, saltBase + 61, 6);

        const height = clamp01(0.25 + 0.9 * h);
        const v8 = Math.floor(height * 255);
        data[idx] = v8;
        data[idx + 1] = v8;
        data[idx + 2] = v8;
        data[idx + 3] = 255;
      }
    }
  });

  const cloudMap =
    kind === "rocky"
      ? makeDataTexture(128, (data, size) => {
          for (let y = 0; y < size; y++) {
            const v = y / (size - 1);
            for (let x = 0; x < size; x++) {
              const u = x / (size - 1);
              const nx = (u - 0.5) * 2;
              const ny = (v - 0.5) * 2;
              const r2 = nx * nx + ny * ny;
              const idx = (y * size + x) * 4;
              if (r2 > 1) {
                data[idx + 3] = 0;
                continue;
              }
              const lat = Math.asin(ny);
              const lon = Math.atan2(nx, Math.sqrt(1 - r2));
              const n = fbm2D(lon * 3.2 + 14.0 + o3, lat * 3.0 - 6.0 + o2, saltBase + 103, 6);
              const wisps = Math.pow(clamp01((n - 0.52) * 2.2), 1.7);
              const alpha = Math.floor(clamp01(wisps) * 255);
              data[idx] = 255;
              data[idx + 1] = 255;
              data[idx + 2] = 255;
              data[idx + 3] = alpha;
            }
          }
        })
      : null;

  return { colorMap, bumpMap, cloudMap };
};

const Planet = ({
  seed,
  kind,
  radius,
  basePosition,
  orbitRadius,
  orbitSpeed,
  spinSpeed,
  tilt,
  theme,
  reducedMotion,
  hasRing,
  detail
}: {
  seed: number;
  kind: "rocky" | "gas" | "ice";
  radius: number;
  basePosition: THREE.Vector3;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  tilt: number;
  theme: "light" | "dark";
  reducedMotion: boolean;
  hasRing?: boolean;
  detail: "high" | "low";
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const { colorMap, bumpMap, cloudMap } = useMemo(() => generatePlanetTextures(seed, kind, theme), [seed, kind, theme]);

  const ringMap = useMemo(() => {
    if (!hasRing) return null;
    return makeCanvasTexture(256, (ctx, size) => {
      const img = ctx.createImageData(size, size);
      const d = img.data;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const u = x / (size - 1);
          const v = y / (size - 1);
          const dx = u - 0.5;
          const dy = v - 0.5;
          const r = Math.sqrt(dx * dx + dy * dy) * 2;
          const idx = (y * size + x) * 4;

          const band = 0.5 + 0.5 * Math.sin(r * 58 + 1.7 * Math.sin(r * 9));
          const alpha = clamp01(Math.pow(clamp01(1 - Math.abs(r - 1.0) * 1.25), 2) * (0.1 + 0.9 * band));
          const c = theme === "dark" ? 220 : 200;
          d[idx] = c;
          d[idx + 1] = c;
          d[idx + 2] = c + 10;
          d[idx + 3] = Math.floor(alpha * 255);
        }
      }
      ctx.putImageData(img, 0, 0);
    });
  }, [hasRing, theme]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();
    const time = reducedMotion ? 0 : t;

    groupRef.current.rotation.z = tilt;

    const phase = seed * 0.0013;
    const ox = Math.cos(time * orbitSpeed + phase) * orbitRadius;
    const oy = Math.sin(time * orbitSpeed * 0.85 + phase) * orbitRadius * 0.6;
    groupRef.current.position.set(basePosition.x + ox, basePosition.y + oy, basePosition.z);

    const spin = time * spinSpeed;
    groupRef.current.rotation.y = spin;
  });

  const surfaceRoughness = kind === "gas" ? 0.35 : kind === "ice" ? 0.55 : 0.7;
  const bumpScale = kind === "gas" ? 0.08 : kind === "ice" ? 0.12 : 0.18;
  const surfaceSegments = detail === "high" ? 56 : 36;
  const atmosphereSegments = detail === "high" ? 40 : 24;
  const ringSegments = detail === "high" ? 96 : 64;

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, surfaceSegments, surfaceSegments]} />
        <meshPhysicalMaterial
          map={colorMap ?? undefined}
          bumpMap={bumpMap}
          bumpScale={bumpScale}
          roughness={surfaceRoughness}
          metalness={0.0}
          clearcoat={0.15}
          clearcoatRoughness={0.65}
          sheen={kind === "ice" ? 0.35 : 0.0}
          sheenRoughness={0.85}
          sheenColor={kind === "ice" ? new THREE.Color("#bfe9ff") : undefined}
          envMapIntensity={0.25}
        />
      </mesh>

      {kind === "rocky" && cloudMap && (
        <mesh>
          <sphereGeometry args={[radius * 1.02, surfaceSegments, surfaceSegments]} />
          <meshStandardMaterial
            map={cloudMap}
            transparent
            opacity={theme === "dark" ? 0.65 : 0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      <mesh>
        <sphereGeometry args={[radius * 1.055, atmosphereSegments, atmosphereSegments]} />
        <meshBasicMaterial
          color={theme === "dark" ? "#a9c8ff" : "#ffffff"}
          transparent
          opacity={theme === "dark" ? 0.08 : 0.05}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {hasRing && ringMap && (
        <mesh rotation={[Math.PI * 0.5, 0, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 2.15, ringSegments]} />
          <meshBasicMaterial
            map={ringMap}
            transparent
            opacity={theme === "dark" ? 0.55 : 0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

const SpaceFog = ({ theme }: { theme: "light" | "dark" }) => {
  const colorA = theme === "dark" ? "#2a3a66" : "#6bb6ff";
  const colorB = theme === "dark" ? "#4b2f6a" : "#b9d6ff";
  return (
    <>
      <mesh position={[8, 5, -25]}>
        <sphereGeometry args={[14, 24, 24]} />
        <meshBasicMaterial color={colorA} transparent opacity={theme === "dark" ? 0.06 : 0.03} depthWrite={false} />
      </mesh>
      <mesh position={[-10, -4, -30]}>
        <sphereGeometry args={[18, 24, 24]} />
        <meshBasicMaterial color={colorB} transparent opacity={theme === "dark" ? 0.05 : 0.025} depthWrite={false} />
      </mesh>
    </>
  );
};

const PlanetariumScene = ({
  theme,
  inputRef,
  reducedMotion,
  detail
}: {
  theme: "light" | "dark";
  inputRef: MutableRefObject<InputState>;
  reducedMotion: boolean;
  detail: "high" | "low";
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame((state, delta) => {
    const { mouseX, mouseY, scroll } = inputRef.current;
    const t = reducedMotion ? 0 : state.clock.getElapsedTime();

    const targetX = mouseX * 0.65;
    const targetY = mouseY * 0.45;
    const camera = state.camera;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 1 - Math.pow(0.001, delta));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 1 - Math.pow(0.001, delta));
    camera.position.z = 14.5 + (theme === "dark" ? 0 : 0.4);
    camera.lookAt(0, 0, 0);

    if (groupRef.current) {
      const scrollTwist = (scroll - 0.5) * 0.6;
      groupRef.current.rotation.y = scrollTwist + t * 0.02;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY * 0.05, 1 - Math.pow(0.001, delta));
    }
  });

  const edgeX = viewport.width * 0.62;
  const edgeY = viewport.height * 0.55;

  return (
    <>
      <ambientLight intensity={theme === "dark" ? 0.35 : 0.45} />
      <directionalLight position={[8, 6, 6]} intensity={theme === "dark" ? 1.2 : 1.0} color={theme === "dark" ? "#cfe6ff" : "#ffffff"} />
      <pointLight position={[-6, -2, 8]} intensity={theme === "dark" ? 0.9 : 0.65} color={theme === "dark" ? "#7db2ff" : "#8fd2ff"} />
      <pointLight position={[6, 2, 10]} intensity={theme === "dark" ? 0.65 : 0.4} color={theme === "dark" ? "#a78bfa" : "#b5c7ff"} />

      <Stars
        radius={220}
        depth={90}
        count={detail === "low" ? (theme === "dark" ? 1600 : 1100) : theme === "dark" ? 3200 : 2000}
        factor={4.8}
        saturation={0}
        fade
        speed={reducedMotion ? 0 : theme === "dark" ? 0.2 : 0.12}
      />

      <SpaceFog theme={theme} />

      <group ref={groupRef}>
        <Planet
          seed={112233}
          kind="gas"
          radius={2.7}
          basePosition={new THREE.Vector3(edgeX, edgeY * 0.15, -6.5)}
          orbitRadius={0.75}
          orbitSpeed={0.11}
          spinSpeed={0.08}
          tilt={0.35}
          theme={theme}
          reducedMotion={reducedMotion}
          hasRing
          detail={detail}
        />
        <Planet
          seed={554433}
          kind="rocky"
          radius={1.85}
          basePosition={new THREE.Vector3(-edgeX * 1.02, -edgeY * 0.25, -4.0)}
          orbitRadius={0.55}
          orbitSpeed={0.14}
          spinSpeed={0.16}
          tilt={-0.25}
          theme={theme}
          reducedMotion={reducedMotion}
          detail={detail}
        />
        <Planet
          seed={998877}
          kind="ice"
          radius={1.2}
          basePosition={new THREE.Vector3(edgeX * 0.25, -edgeY * 1.05, -3.2)}
          orbitRadius={0.42}
          orbitSpeed={0.18}
          spinSpeed={0.22}
          tilt={0.12}
          theme={theme}
          reducedMotion={reducedMotion}
          detail={detail}
        />
      </group>

      {detail === "high" && !reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={theme === "dark" ? 0.45 : 0.3}
            luminanceThreshold={theme === "dark" ? 0.3 : 0.38}
            luminanceSmoothing={0.85}
            blendFunction={BlendFunction.SCREEN}
          />
          <Vignette eskil={false} offset={0.22} darkness={theme === "dark" ? 0.7 : 0.52} />
          <Noise opacity={theme === "dark" ? 0.025 : 0.018} premultiply blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      )}
    </>
  );
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
};

const PlanetariumBackground = () => {
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const inputRef = useRef<InputState>({ mouseX: 0, mouseY: 0, scroll: 0 });
  const [detail, setDetail] = useState<"high" | "low">("high");
  const [dpr, setDpr] = useState(() => (typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 1.25)));
  const effectiveDetail = reducedMotion ? "low" : detail;
  const effectiveDpr = reducedMotion ? 1 : dpr;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      inputRef.current.mouseX = x;
      inputRef.current.mouseY = -y;
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      inputRef.current.scroll = clamp01(window.scrollY / max);
    };

    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className={`planetarium-bg ${theme}`} aria-hidden="true">
      <Canvas
        dpr={effectiveDpr}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 14.5], fov: 50, near: 0.1, far: 500 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        {!reducedMotion && (
          <PerformanceMonitor
            onChange={(api) => {
              const nextDetail = api.factor < 0.5 ? "low" : "high";
              setDetail(nextDetail);
              setDpr(nextDetail === "low" ? 1 : Math.min(window.devicePixelRatio || 1, 1.25));
            }}
          />
        )}
        <PlanetariumScene theme={theme} inputRef={inputRef} reducedMotion={reducedMotion} detail={effectiveDetail} />
      </Canvas>
    </div>
  );
};

export default PlanetariumBackground;
