'use client';

import {
  FC, Suspense, useRef, useLayoutEffect, useEffect, useMemo, useState,
} from 'react';
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber';
import {
  OrbitControls, useGLTF, useFBX, useProgress, Html, Environment, ContactShadows,
} from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

// ─── Stałe ──────────────────────────────────────────────────────────────────────

const deg2rad = (d: number) => (d * Math.PI) / 180;
const DECIDE       = 8;
const ROTATE_SPEED = 0.005;
const INERTIA      = 0.925;
const PARALLAX_MAG  = 0.05;
const PARALLAX_EASE = 0.12;
const HOVER_MAG  = deg2rad(6);
const HOVER_EASE = 0.15;

// ─── Helper: czyszczenie GPU ─────────────────────────────────────────────────────

const cleanMaterial = (material: THREE.Material): void => {
  material.dispose();
  for (const key of Object.keys(material)) {
    // Rozwiązanie TS2352: najpierw rzutujemy na unknown, potem na Record
    const value = (material as unknown as Record<string, unknown>)[key];
    
    if (value && typeof value === 'object' && 'minFilter' in value) {
      (value as THREE.Texture).dispose();
    }
  }
};

// ─── Helper: SSR-safe detekcja dotyku ────────────────────────────────────────────

const useIsTouch = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
};

// ─── Public API ──────────────────────────────────────────────────────────────────

export interface ViewerProps {
  url: string;
  width?: number | string;
  height?: number | string;
  modelXOffset?: number;
  modelYOffset?: number;
  defaultRotationX?: number; 
  defaultRotationY?: number; 
  defaultZoom?: number;
  minZoomDistance?: number;
  maxZoomDistance?: number;
  enableMouseParallax?: boolean;
  enableManualRotation?: boolean;
  enableHoverRotation?: boolean;
  enableManualZoom?: boolean;
  ambientIntensity?: number;
  keyLightIntensity?: number;
  fillLightIntensity?: number;
  rimLightIntensity?: number;
  environmentPreset?: 'city' | 'sunset' | 'night' | 'dawn' | 'studio' | 'apartment' | 'forest' | 'park' | 'none';
  autoFrame?: boolean;
  placeholderSrc?: string;
  showScreenshotButton?: boolean;
  fadeIn?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  onModelLoaded?: () => void;
}

// ─── Loader ──────────────────────────────────────────────────────────────────────

const Loader: FC<{ placeholderSrc?: string }> = ({ placeholderSrc }) => {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <Html center>
      {placeholderSrc ? (
        <img src={placeholderSrc} width={128} height={128} className="blur-lg rounded-lg" alt="Loading" />
      ) : (
        <div className="text-zinc-600 font-bold bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm">
          {Math.round(progress)}%
        </div>
      )}
    </Html>
  );
};

// ─── Desktop Controls ────────────────────────────────────────────────────────────

const DesktopControls: FC<{ pivot: THREE.Vector3; min: number; max: number; zoomEnabled: boolean }> = ({
  pivot, min, max, zoomEnabled,
}) => {
  const ref = useRef<any>(null);
  useFrame(() => {
    if (ref.current) ref.current.target.copy(pivot);
  });
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableRotate={false}
      enableZoom={zoomEnabled}
      minDistance={min}
      maxDistance={max}
    />
  );
};

// ─── ModelCore – cała logika 3D bez ładowania ─────────────────────────────────────

interface ModelCoreProps {
  content: THREE.Object3D;
  url: string;
  xOff: number;
  yOff: number;
  pivot: THREE.Vector3;
  initRotX: number; 
  initRotY: number; 
  minZoom: number;
  maxZoom: number;
  enableMouseParallax: boolean;
  enableManualRotation: boolean;
  enableHoverRotation: boolean;
  enableManualZoom: boolean;
  autoFrame: boolean;
  fadeIn: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  onLoaded?: () => void;
}

const ModelCore: FC<ModelCoreProps> = ({
  content, xOff, yOff, pivot, initRotX, initRotY,
  minZoom, maxZoom, enableMouseParallax, enableManualRotation,
  enableHoverRotation, enableManualZoom, autoFrame, fadeIn,
  autoRotate, autoRotateSpeed, onLoaded,
}) => {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const { camera, gl } = useThree();
  const isTouch = useIsTouch(); 

  const vel  = useRef({ x: 0, y: 0 });
  const tPar = useRef({ x: 0, y: 0 });
  const cPar = useRef({ x: 0, y: 0 });
  const tHov = useRef({ x: 0, y: 0 });
  const cHov = useRef({ x: 0, y: 0 });

  const pivotW = useRef(new THREE.Vector3());
  const tmpVec = useRef(new THREE.Vector3());

  // 🔥 GARBAGE COLLECTOR
  useEffect(() => {
    return () => {
      content.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(cleanMaterial);
        } else if (mesh.material) {
          cleanMaterial(mesh.material);
        }
      });
    };
  }, [content]);

  // Inicjalizacja modelu
  useLayoutEffect(() => {
    const g = inner.current;
    if (!g) return;

    g.updateWorldMatrix(true, true);
    const sphere = new THREE.Box3().setFromObject(g).getBoundingSphere(new THREE.Sphere());
    const s = 1 / (sphere.radius * 2);
    g.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    g.scale.setScalar(s);

    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (fadeIn) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => { const c = m.clone(); c.transparent = true; c.opacity = 0; return c; })
          : (() => { const c = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial; c.transparent = true; c.opacity = 0; return c; })();
      }
    });

    g.getWorldPosition(pivotW.current);
    pivot.copy(pivotW.current);
    if (outer.current) outer.current.rotation.set(initRotX, initRotY, 0);

    if (autoFrame && (camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as THREE.PerspectiveCamera;
      const fitR  = sphere.radius * s;
      const d     = (fitR * 1.2) / Math.sin((persp.fov * Math.PI) / 180 / 2);
      persp.position.set(pivotW.current.x, pivotW.current.y, pivotW.current.z + d);
      persp.near = d / 10;
      persp.far  = d * 10;
      persp.updateProjectionMatrix();
    }

    if (fadeIn) {
      let t = 0;
      const id = setInterval(() => {
        t += 0.05;
        const v = Math.min(t, 1);
        g.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: any) => { m.opacity = v; });
          } else {
            (mesh.material as any).opacity = v;
          }
        });
        invalidate();
        if (v >= 1) { clearInterval(id); onLoaded?.(); }
      }, 16);
      return () => clearInterval(id);
    } else {
      onLoaded?.();
    }
  }, [content, camera, fadeIn, autoFrame, initRotX, initRotY, pivot, onLoaded]);

  // Desktop: manual rotation
  useEffect(() => {
    if (!enableManualRotation || isTouch || !gl.domElement) return;
    const el = gl.domElement;
    let drag = false;
    let lx = 0, ly = 0;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      drag = true; lx = e.clientX; ly = e.clientY;
      window.addEventListener('pointerup', up, { once: true });
    };
    const move = (e: PointerEvent) => {
      if (!drag || !outer.current) return;
      const dx = e.clientX - lx; const dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      outer.current.rotation.y += dx * ROTATE_SPEED;
      outer.current.rotation.x += dy * ROTATE_SPEED;
      vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
      invalidate();
    };
    const up = () => { drag = false; };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [gl, enableManualRotation, isTouch]);

  // Touch: rotate + pinch-zoom
  useEffect(() => {
    if (!isTouch || !gl.domElement) return;
    const el = gl.domElement;
    const pts = new Map<number, { x: number; y: number }>();
    type Mode = 'idle' | 'decide' | 'rotate' | 'pinch';
    let mode: Mode = 'idle';
    let sx = 0, sy = 0, lx = 0, ly = 0, startDist = 0, startZ = 0;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        mode = 'decide'; sx = lx = e.clientX; sy = ly = e.clientY;
      } else if (pts.size === 2 && enableManualZoom) {
        mode = 'pinch';
        const [p1, p2] = Array.from(pts.values());
        startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        startZ = camera.position.z;
        e.preventDefault();
      }
      invalidate();
    };

    const move = (e: PointerEvent) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX; p.y = e.clientY;

      if (mode === 'decide') {
        const dx = e.clientX - sx; const dy = e.clientY - sy;
        if (Math.abs(dx) > DECIDE || Math.abs(dy) > DECIDE) {
          if (enableManualRotation && Math.abs(dx) > Math.abs(dy)) {
            mode = 'rotate'; el.setPointerCapture(e.pointerId);
          } else {
            mode = 'idle'; pts.clear();
          }
        }
      }

      if (mode === 'rotate' && outer.current) {
        e.preventDefault();
        const dx = e.clientX - lx; const dy = e.clientY - ly;
        lx = e.clientX; ly = e.clientY;
        outer.current.rotation.y += dx * ROTATE_SPEED;
        outer.current.rotation.x += dy * ROTATE_SPEED;
        vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
        invalidate();
      } else if (mode === 'pinch' && pts.size === 2) {
        e.preventDefault();
        const [p1, p2] = Array.from(pts.values());
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d === 0) return;
        camera.position.z = THREE.MathUtils.clamp(startZ * (startDist / d), minZoom, maxZoom);
        invalidate();
      }
    };

    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size === 0) mode = 'idle';
      else if (mode === 'pinch' && pts.size < 2) mode = 'idle';
    };

    el.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [gl, camera, isTouch, enableManualRotation, enableManualZoom, minZoom, maxZoom]);

  // Desktop: parallax + hover rotation
  useEffect(() => {
    if (isTouch) return;
    const mm = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (enableMouseParallax)  tPar.current = { x: -nx * PARALLAX_MAG, y: -ny * PARALLAX_MAG };
      if (enableHoverRotation)  tHov.current = { x:  ny * HOVER_MAG,    y:  nx * HOVER_MAG };
      invalidate();
    };
    window.addEventListener('pointermove', mm);
    return () => window.removeEventListener('pointermove', mm);
  }, [isTouch, enableMouseParallax, enableHoverRotation]);

  useFrame((_, dt) => {
    if (!outer.current) return;
    let need = false;

    cPar.current.x += (tPar.current.x - cPar.current.x) * PARALLAX_EASE;
    cPar.current.y += (tPar.current.y - cPar.current.y) * PARALLAX_EASE;
    const phx = cHov.current.x, phy = cHov.current.y;
    cHov.current.x += (tHov.current.x - cHov.current.x) * HOVER_EASE;
    cHov.current.y += (tHov.current.y - cHov.current.y) * HOVER_EASE;

    tmpVec.current.copy(pivotW.current).project(camera);
    tmpVec.current.x += xOff + cPar.current.x;
    tmpVec.current.y += yOff + cPar.current.y;
    outer.current.position.copy(tmpVec.current.unproject(camera));

    outer.current.rotation.x += cHov.current.x - phx;
    outer.current.rotation.y += cHov.current.y - phy;

    if (autoRotate) { outer.current.rotation.y += autoRotateSpeed * dt; need = true; }

    outer.current.rotation.y += vel.current.x;
    outer.current.rotation.x += vel.current.y;
    vel.current.x *= INERTIA;
    vel.current.y *= INERTIA;
    if (Math.abs(vel.current.x) > 1e-4 || Math.abs(vel.current.y) > 1e-4) need = true;

    if (
      Math.abs(cPar.current.x - tPar.current.x) > 1e-4 ||
      Math.abs(cPar.current.y - tPar.current.y) > 1e-4 ||
      Math.abs(cHov.current.x - tHov.current.x) > 1e-4 ||
      Math.abs(cHov.current.y - tHov.current.y) > 1e-4
    ) need = true;

    if (need) invalidate();
  });

  return (
    <group ref={outer}>
      <group ref={inner}>
        <primitive object={content} />
      </group>
    </group>
  );
};

// ─── Loadery per format ──────────────────────────────────────────────────────────

type InnerLoaderProps = Omit<ModelCoreProps, 'content'>;

const GLBLoader: FC<InnerLoaderProps> = (props) => {
  const { scene } = useGLTF(props.url);
  const content = useMemo(() => SkeletonUtils.clone(scene) as THREE.Group, [scene]);

  // Wyczyść cache GLTF kiedy komponent zostanie usunięty!
  useEffect(() => {
    return () => { useGLTF.clear(props.url); };
  }, [props.url]);

  return <ModelCore {...props} content={content} />;
};

const FBXLoader: FC<InnerLoaderProps> = (props) => {
  const fbx = useFBX(props.url);
  const content = useMemo(() => fbx.clone(), [fbx]);
  return <ModelCore {...props} content={content} />;
};

const ModelLoaderWrapper: FC<InnerLoaderProps> = (props) => {
  const ext = props.url.split('.').pop()!.toLowerCase();
  if (ext === 'fbx') return <FBXLoader {...props} />;
  return <GLBLoader {...props} />;
};

// ─── ModelViewer (root) ───────────────────────────────────────────────────────────

const ModelViewer: FC<ViewerProps> = ({
  url, width = 400, height = 400, modelXOffset = 0, modelYOffset = 0, defaultRotationX = 100, defaultRotationY = 100,
  defaultZoom = 0.5, minZoomDistance = 0.5, maxZoomDistance = 10, enableMouseParallax = true, enableManualRotation = true,
  enableHoverRotation = true, enableManualZoom = true, ambientIntensity = 0.3, keyLightIntensity = 1, fillLightIntensity = 0.5,
  rimLightIntensity = 0.8, environmentPreset = 'forest', autoFrame = false, placeholderSrc, showScreenshotButton = true,
  fadeIn = false, autoRotate = false, autoRotateSpeed = 0.35, onModelLoaded,
}) => {
  const isTouchDevice = useIsTouch();
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    if (url.endsWith('glb') || url.endsWith('gltf')) {
      useGLTF.preload(url);
    }
  }, [url]);

  const pivot        = useRef(new THREE.Vector3()).current;
  const contactRef   = useRef<THREE.Mesh>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef     = useRef<THREE.Scene | null>(null);
  const cameraRef    = useRef<THREE.Camera | null>(null);

  const initRotX = deg2rad(defaultRotationX);
  const initRotY = deg2rad(defaultRotationY);
  const camZ     = THREE.MathUtils.clamp(defaultZoom, minZoomDistance, maxZoomDistance);

  const capture = () => {
    const g = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
    if (!g || !s || !c) return;
    g.shadowMap.enabled = false;
    const saved: { l: THREE.Light; cast: boolean }[] = [];
    s.traverse((o: any) => {
      if (o.isLight && 'castShadow' in o) { saved.push({ l: o, cast: o.castShadow }); o.castShadow = false; }
    });
    if (contactRef.current) contactRef.current.visible = false;
    g.render(s, c);
    const link = document.createElement('a');
    link.download = 'urwis-3d.png';
    link.href = g.domElement.toDataURL('image/png');
    link.click();
    g.shadowMap.enabled = true;
    saved.forEach(({ l, cast }) => (l.castShadow = cast));
    if (contactRef.current) contactRef.current.visible = true;
    invalidate();
  };

  return (
    <div style={{ width, height, touchAction: 'pan-y pinch-zoom' }} className="relative">
      {showScreenshotButton && (
        <button
          onClick={capture}
          className="absolute top-4 right-4 z-10 cursor-pointer px-4 py-2 border border-white/40 rounded-xl bg-white/10 backdrop-blur text-white hover:bg-white hover:text-zinc-900 transition-colors shadow-sm"
        >
          Zrób zdjęcie
        </button>
      )}

      <Canvas
        key={canvasKey}
        shadows
        frameloop="demand"
        gl={{
          preserveDrawingBuffer: true,
          alpha: true,
          powerPreference: 'high-performance',
          antialias: true,
        }}
        onCreated={({ gl, scene, camera }) => {
          rendererRef.current  = gl;
          sceneRef.current     = scene;
          cameraRef.current    = camera;
          
          gl.toneMapping       = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace  = THREE.SRGBColorSpace;
          scene.background     = null;

          // 🔥 Wpinamy listener bezpośrednio po stworzeniu Canvasa
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('WebGL Context Lost! Restart...');
            setTimeout(() => setCanvasKey((k) => k + 1), 500);
          }, false);
        }}
        camera={{ fov: 50, position: [0, 0, camZ], near: 0.01, far: 100 }}
        style={{ background: 'transparent' }}
      >
        {environmentPreset !== 'none' && (
          <Environment preset={environmentPreset as any} background={false} />
        )}

        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[5,  5,  5]} intensity={keyLightIntensity}  castShadow />
        <directionalLight position={[-5, 2,  5]} intensity={fillLightIntensity} />
        <directionalLight position={[0,  4, -5]} intensity={rimLightIntensity}  />

        <ContactShadows
          ref={contactRef as any}
          position={[0, -0.5, 0]}
          opacity={0.15}
          scale={10}
          blur={3}
          color="#000000"
        />

        <Suspense fallback={<Loader placeholderSrc={placeholderSrc} />}>
          {/* 🔥 Używamy loadera, który teraz poprawnie zaciąga dane i przekazuje je do rdzenia */}
          <ModelLoaderWrapper
            url={url} xOff={modelXOffset} yOff={modelYOffset} pivot={pivot} initRotX={initRotX} initRotY={initRotY}
            minZoom={minZoomDistance} maxZoom={maxZoomDistance} enableMouseParallax={enableMouseParallax}
            enableManualRotation={enableManualRotation} enableHoverRotation={enableHoverRotation} enableManualZoom={enableManualZoom}
            autoFrame={autoFrame} fadeIn={fadeIn} autoRotate={autoRotate} autoRotateSpeed={autoRotateSpeed} onLoaded={onModelLoaded}
          />
        </Suspense>

        {!isTouchDevice && (
          <DesktopControls pivot={pivot} min={minZoomDistance} max={maxZoomDistance} zoomEnabled={enableManualZoom} />
        )}
      </Canvas>
    </div>
  );
};

export default ModelViewer;