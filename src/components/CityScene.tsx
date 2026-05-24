"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { Codebase } from "@/lib/types";
import { layoutFiles, type Positioned } from "@/lib/layout";
import { useSelectionStore } from "@/lib/store";
import { Building } from "./Building";
import { BuildingLabels } from "./BuildingLabels";
import { DependencyLines } from "./DependencyLines";

type Props = {
  codebase: Codebase;
};

const GRID_SPACING = 4;
const FOG_COLOR = "#05060a";

type Bounds = {
  cx: number;
  cz: number;
  size: number;
  yMax: number;
};

function computeBounds(positioned: Positioned[]): Bounds {
  if (positioned.length === 0) {
    return { cx: 0, cz: 0, size: 8, yMax: 4 };
  }
  let xMin = Infinity,
    xMax = -Infinity,
    zMin = Infinity,
    zMax = -Infinity,
    yMax = 0;
  for (const p of positioned) {
    const half = p.dims.width / 2;
    xMin = Math.min(xMin, p.position[0] - half);
    xMax = Math.max(xMax, p.position[0] + half);
    zMin = Math.min(zMin, p.position[2] - half);
    zMax = Math.max(zMax, p.position[2] + half);
    yMax = Math.max(yMax, p.dims.height);
  }
  return {
    cx: (xMin + xMax) / 2,
    cz: (zMin + zMax) / 2,
    size: Math.max(xMax - xMin, zMax - zMin),
    yMax,
  };
}

export function CityScene({ codebase }: Props) {
  const setSelected = useSelectionStore((s) => s.setSelected);
  const selectedId = useSelectionStore((s) => s.selectedId);

  const positioned = useMemo(
    () => layoutFiles(codebase.files, GRID_SPACING),
    [codebase.files],
  );

  const bounds = useMemo(() => computeBounds(positioned), [positioned]);

  const camera = useMemo(() => {
    const distance = Math.max(22, bounds.size * 1.9);
    return {
      position: [
        bounds.cx + distance * 0.62,
        Math.max(10, bounds.size * 0.7),
        bounds.cz + distance * 0.62,
      ] as [number, number, number],
      target: [bounds.cx, bounds.yMax * 0.45, bounds.cz] as [
        number,
        number,
        number,
      ],
      fov: 45,
    };
  }, [bounds]);

  // Auto-select the home page on first mount so the detail panel shows
  // immediately rather than greeting the user with an empty viewport.
  useEffect(() => {
    if (selectedId) return;
    const home =
      codebase.files.find((f) => f.path === "src/app/page.tsx") ??
      codebase.files.find((f) => f.role === "entry");
    if (home) setSelected(home.id);
    // intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: camera.position, fov: camera.fov }}
      gl={{
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      style={{ position: "absolute", inset: 0, background: FOG_COLOR }}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={[FOG_COLOR]} />
      <fog
        attach="fog"
        args={[FOG_COLOR, bounds.size * 1.4, bounds.size * 4.5]}
      />

      {/* Key light (warm, soft) */}
      <directionalLight
        position={[bounds.cx + 12, 22, bounds.cz + 8]}
        intensity={1.0}
        color="#fef3c7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />
      {/* Rim lights */}
      <directionalLight
        position={[bounds.cx - 15, 8, bounds.cz - 10]}
        intensity={1.3}
        color="#22d3ee"
      />
      <directionalLight
        position={[bounds.cx + 10, 6, bounds.cz - 14]}
        intensity={1.0}
        color="#a855f7"
      />
      <ambientLight intensity={0.22} color="#2a275a" />

      {/* Wet reflective ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[bounds.cx, 0, bounds.cz]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1.2}
          roughness={0.85}
          depthScale={0.9}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
          color="#0a0c14"
          metalness={0.6}
          mirror={0}
        />
      </mesh>

      {positioned.map(({ file, position, dims }) => (
        <Building
          key={file.id}
          file={file}
          position={position}
          dims={dims}
        />
      ))}

      <DependencyLines edges={codebase.edges} positioned={positioned} />

      <BuildingLabels positioned={positioned} />

      <OrbitControls
        makeDefault
        enableDamping
        target={camera.target}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={6}
        maxDistance={Math.max(60, bounds.size * 5)}
      />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
