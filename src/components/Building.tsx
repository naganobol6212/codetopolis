"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { FileNode } from "@/lib/types";
import { useSelectionStore } from "@/lib/store";
import type { BuildingDims } from "@/lib/layout";
import { roleColor } from "@/lib/roles";

type Props = {
  file: FileNode;
  position: [number, number, number];
  dims: BuildingDims;
};

export function Building({ file, position, dims }: Props) {
  const selectedId = useSelectionStore((s) => s.selectedId);
  const hoveredId = useSelectionStore((s) => s.hoveredId);
  const setSelected = useSelectionStore((s) => s.setSelected);
  const setHovered = useSelectionStore((s) => s.setHovered);

  const color = useMemo(() => roleColor(file.role), [file.role]);
  const isEntry = file.role === "entry";
  const isMuted = file.role === "test" || file.role === "type";

  const isSelected = selectedId === file.id;
  const isHovered = hoveredId === file.id;

  const baseEmissive = isMuted ? 0.18 : isEntry ? 0.9 : 0.45;
  const emissiveIntensity = isSelected
    ? Math.max(baseEmissive, 2.4)
    : isHovered
    ? Math.max(baseEmissive, 1.2)
    : baseEmissive;

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
    <group position={[x, 0, z]}>
      <mesh
        position={[0, height / 2, 0]}
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
          metalness={isMuted ? 0.25 : 0.55}
          roughness={isMuted ? 0.75 : 0.35}
          transparent={isMuted}
          opacity={isMuted ? 0.75 : 1}
        />
      </mesh>

      {isEntry && <EntryHalo y={height + 0.25} radius={width * 0.7 + 0.4} />}
    </group>
  );
}

function EntryHalo({ y, radius }: { y: number; radius: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.6;
  });

  return (
    <group position={[0, y, 0]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.06, 12, 64]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#fbbf24"
          emissiveIntensity={3.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#fbbf24" intensity={1.2} distance={radius * 4} decay={2} />
    </group>
  );
}
