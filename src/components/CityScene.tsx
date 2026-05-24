"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  MeshReflectorMaterial,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { useMemo } from "react";
import type { Codebase } from "@/lib/types";
import { layoutFiles } from "@/lib/layout";
import { useSelectionStore } from "@/lib/store";
import { Building } from "./Building";
import { BuildingLabels } from "./BuildingLabels";
import { DependencyLines } from "./DependencyLines";

type Props = {
  codebase: Codebase;
};

const GRID_SPACING = 4;
const FOG_COLOR = "#05060a";

export function CityScene({ codebase }: Props) {
  const setSelected = useSelectionStore((s) => s.setSelected);

  const positioned = useMemo(
    () => layoutFiles(codebase.files, GRID_SPACING),
    [codebase.files],
  );

  return (
    <Canvas
      shadows
      camera={{ position: [18, 14, 18], fov: 45 }}
      gl={{
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ position: "absolute", inset: 0, background: FOG_COLOR }}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, 25, 90]} />

      {/* HDR environment for PBR reflections */}
      <Environment preset="night" environmentIntensity={0.35} />

      {/* Key light (warm, soft) */}
      <directionalLight
        position={[12, 22, 8]}
        intensity={0.9}
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
      {/* Rim lights — cyan from one side, magenta from the other */}
      <directionalLight
        position={[-15, 8, -10]}
        intensity={1.2}
        color="#22d3ee"
      />
      <directionalLight
        position={[10, 6, -14]}
        intensity={0.9}
        color="#a855f7"
      />
      <ambientLight intensity={0.08} color="#1e1b4b" />

      {/* Wet reflective ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
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
        maxPolarAngle={Math.PI / 2.1}
        minDistance={6}
        maxDistance={60}
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
