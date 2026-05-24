"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useMemo } from "react";
import type { Codebase } from "@/lib/types";
import { layoutFiles } from "@/lib/layout";
import { useSelectionStore } from "@/lib/store";
import { Building } from "./Building";
import { DependencyLines } from "./DependencyLines";

type Props = {
  codebase: Codebase;
};

const GRID_SPACING = 4;

export function CityScene({ codebase }: Props) {
  const setSelected = useSelectionStore((s) => s.setSelected);

  const positioned = useMemo(
    () => layoutFiles(codebase.files, GRID_SPACING),
    [codebase.files],
  );

  return (
    <Canvas
      shadows
      camera={{ position: [15, 15, 15], fov: 50 }}
      style={{ position: "absolute", inset: 0, background: "#0f172a" }}
      onPointerMissed={() => setSelected(null)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Grid
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#334155"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />

      {positioned.map(({ file, position, dims }) => (
        <Building
          key={file.id}
          file={file}
          position={position}
          dims={dims}
        />
      ))}

      <DependencyLines edges={codebase.edges} positioned={positioned} />

      <OrbitControls makeDefault enableDamping />
    </Canvas>
  );
}
