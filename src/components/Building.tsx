"use client";

import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { FileNode } from "@/lib/types";
import { useSelectionStore } from "@/lib/store";
import type { BuildingDims } from "@/lib/layout";

type Props = {
  file: FileNode;
  position: [number, number, number];
  dims: BuildingDims;
};

function locToColor(loc: number): string {
  if (loc < 50) return "#22d3ee";
  if (loc < 150) return "#a78bfa";
  if (loc < 400) return "#f472b6";
  return "#ef4444";
}

export function Building({ file, position, dims }: Props) {
  const selectedId = useSelectionStore((s) => s.selectedId);
  const hoveredId = useSelectionStore((s) => s.hoveredId);
  const setSelected = useSelectionStore((s) => s.setSelected);
  const setHovered = useSelectionStore((s) => s.setHovered);

  const color = useMemo(() => locToColor(file.loc), [file.loc]);

  const isSelected = selectedId === file.id;
  const isHovered = hoveredId === file.id;
  const emissiveIntensity = isSelected ? 2.4 : isHovered ? 1.2 : 0.45;

  const [x, , z] = position;
  const { height, width } = dims;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelected(isSelected ? null : file.id);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(file.id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(null);
    document.body.style.cursor = "default";
  };

  return (
    <mesh
      position={[x, height / 2, z]}
      castShadow
      receiveShadow
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[width, height, width]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.55}
        roughness={0.35}
      />
    </mesh>
  );
}
