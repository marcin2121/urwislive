'use client';

import {
  FC, Suspense, useRef, useLayoutEffect, useEffect, useMemo, useState,
} from 'react';
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber';
import {
  OrbitControls, useGLTF, useFBX, Html, Environment, ContactShadows,
} from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import Image from 'next/image';

// ─── Stałe ──────────────────────────────────────────────────────────────────────

const deg2rad = (d: number) => (d * Math.PI) / 180;
const _DECIDE       = 8;
const _ROTATE_SPEED = 0.005;
const INERTIA       = 0.925;
const _PARALLAX_MAG  = 0.05;
const PARALLAX_EASE = 0.12;
const _HOVER_MAG  = deg2rad(6);
const HOVER_EASE = 0.15;

// ─── Helper: czyszczenie GPU ─────────────────────────────────────────────────────

const cleanMaterial = (material: THREE.Material): void => {
  material.dispose();
  const m = material as any;
  for (const key in m) {
    if (m[key] && m[key].isTexture) {
      m[key].dispose();
    }
  }
};

const useIsTouch = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
};

// ─── Public API ──────────────────────────────────────────────────────────────────

export interface ViewerProps {
  url: string;
  title?: string;
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

// ─── Loader (Bez useProgress, naprawia błąd setState w React 18) ────────────────

const Loader: FC<{ placeholderSrc?: string }> = ({ placeholderSrc }) => {
  return (
    <Html center>
      {placeholderSrc ? (
        <Image 
          src={placeholderSrc} 
          width={128} 
          height={128} 
          className="animate-pulse blur-md rounded-full select-none pointer-events-none" 
          alt="Ładowanie modelu 3D"
          priority 
        />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0055ff]/30 border-t-[#0055ff] rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-600 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-white/40">
            Wczytywanie
          </span>
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
    if (ref.current) ref.current.target.lerp(pivot, 0.1);
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

// ─── ModelCore ───────────────────────────────────────────────────────────────────

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
  minZoom: _minZoom, maxZoom: _maxZoom, enableMouseParallax: _enableMouseParallax, enableManualRotation: _enableManualRotation,
  enableHoverRotation: _enableHoverRotation, enableManualZoom: _enableManualZoom, autoFrame, fadeIn,
  autoRotate, autoRotateSpeed, onLoaded,
}) => {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const { camera, gl: _gl } = useThree();
  const isTouch: boolean = useIsTouch(); 

  const vel   = useRef({ x: 0, y: 0 });
  const tPar = useRef({ x: 0, y: 0 });
  const cPar = useRef({ x: 0, y: 0 });
  const tHov = useRef({ x: 0, y: 0 });
  const cHov = useRef({ x: 0, y: 0 });

  const pivotW = useRef(new THREE.Vector3());
  const tmpVec = useRef(new THREE.Vector3());

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

  useLayoutEffect(() => {
    const g = inner.current;
    if (!g) return;

    g.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(g);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    
    const s = 1.2 / (sphere.radius * 2);
    g.position.set(-sphere.center.x, -sphere.center.y, -sphere.center.z);
    g.scale.setScalar(s);

    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.envMapIntensity = 1.2;
      }

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
      const d     = (fitR * 1.4) / Math.sin((persp.fov * Math.PI) / 360);
      persp.position.set(pivotW.current.x, pivotW.current.y, pivotW.current.z + d);
      persp.updateProjectionMatrix();
    }

    if (fadeIn) {
      let t = 0;
      const id = setInterval(() => {
        t += 0.04;
        const v = Math.min(t, 1);
        g.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: THREE.Material) => { m.opacity = v; });
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

  useFrame((state, dt) => {
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
    if (Math.abs(cPar.current.x - tPar.current.x) > 1e-4) need = true;

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

// ─── ModelViewer (root) ───────────────────────────────────────────────────────────

const ModelViewer: FC<ViewerProps> = ({
  url, title = "Prezentacja produktu 3D", width = "100%", height = 400, modelXOffset = 0, modelYOffset = 0, defaultRotationX = 0, defaultRotationY = 0,
  defaultZoom = 2, minZoomDistance = 0.5, maxZoomDistance = 10, enableMouseParallax = true, enableManualRotation = true,
  enableHoverRotation = true, enableManualZoom = true, ambientIntensity = 0.5, keyLightIntensity = 1, fillLightIntensity = 0.5,
  rimLightIntensity: _rimLightIntensity = 0.8, environmentPreset = 'city', autoFrame = true, placeholderSrc, showScreenshotButton = true,
  fadeIn = true, autoRotate = false, autoRotateSpeed = 0.35, onModelLoaded,
}) => {
  const isTouchDevice = useIsTouch();
  const [canvasKey, setCanvasKey] = useState(0);

  const [pivot] = useState(() => new THREE.Vector3());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  const capture = () => {
    const g = rendererRef.current, s = sceneRef.current, c = cameraRef.current;
    if (!g || !s || !c) return;
    g.render(s, c);
    const link = document.createElement('a');
    link.download = 'urwis-3d.png';
    link.href = g.domElement.toDataURL('image/png');
    link.click();
  };

  return (
    <div 
      style={{ width, height, touchAction: isTouchDevice ? 'auto' : 'none' }} 
      className={`relative group bg-zinc-50/50 rounded-3xl overflow-hidden border border-zinc-200 ${isTouchDevice ? 'pointer-events-none select-none' : ''}`}
      role="region" 
      aria-label={title}
    >
      {showScreenshotButton && (
        <button
          onClick={capture}
          aria-label="Pobierz zdjęcie modelu 3D"
          className="absolute top-6 right-6 z-20 cursor-pointer px-5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-zinc-900 font-bold text-xs shadow-xl border border-zinc-200 hover:bg-zinc-900 hover:text-white transition-all active:scale-95 opacity-0 group-hover:opacity-100"
        >
          Zapisz kadr
        </button>
      )}

      <Canvas
        key={canvasKey}
        shadows
        dpr={[1, 2]}
        frameloop="demand"
        gl={{
          preserveDrawingBuffer: true,
          alpha: true,
          powerPreference: 'high-performance',
          antialias: true,
        }}
        onCreated={({ gl, scene, camera }) => {
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setTimeout(() => setCanvasKey((k) => k + 1), 500);
          }, false);
        }}
        camera={{ fov: 45, position: [0, 0, defaultZoom] }}
      >
        <Suspense fallback={<Loader placeholderSrc={placeholderSrc} />}>
          {environmentPreset !== 'none' && (
            <Environment preset={environmentPreset as any} />
          )}

          <ambientLight intensity={ambientIntensity} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={keyLightIntensity} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={fillLightIntensity} />
          
          <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={15} blur={2.5} far={1} />

          <ModelLoaderWrapper
            url={url} xOff={modelXOffset} yOff={modelYOffset} pivot={pivot} 
            initRotX={deg2rad(defaultRotationX)} initRotY={deg2rad(defaultRotationY)}
            minZoom={minZoomDistance} maxZoom={maxZoomDistance} 
            enableMouseParallax={enableMouseParallax}
            enableManualRotation={enableManualRotation} 
            enableHoverRotation={enableHoverRotation} 
            enableManualZoom={enableManualZoom}
            autoFrame={autoFrame} fadeIn={fadeIn} 
            autoRotate={autoRotate} autoRotateSpeed={autoRotateSpeed} 
            onLoaded={onModelLoaded}
          />

          {!isTouchDevice && (
            <DesktopControls pivot={pivot} min={minZoomDistance} max={maxZoomDistance} zoomEnabled={enableManualZoom} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

const GLBLoader: FC<Omit<ModelCoreProps, 'content'>> = (props) => {
  const { scene } = useGLTF(props.url);
  const content = useMemo(() => SkeletonUtils.clone(scene) as THREE.Group, [scene]);
  return <ModelCore {...props} content={content} />;
};

const FBXLoader: FC<Omit<ModelCoreProps, 'content'>> = (props) => {
  const fbx = useFBX(props.url);
  const content = useMemo(() => fbx.clone(), [fbx]);
  return <ModelCore {...props} content={content} />;
};

const ModelLoaderWrapper: FC<Omit<ModelCoreProps, 'content'>> = (props) => {
  const ext = props.url.split('.').pop()?.toLowerCase();
  if (ext === 'fbx') return <FBXLoader {...props} />;
  return <GLBLoader {...props} />;
};

export default ModelViewer;