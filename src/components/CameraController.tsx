"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Positioned } from "@/lib/layout";
import { useSelectionStore } from "@/lib/store";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Props = {
  positioned: Positioned[];
  // The default target the camera should sit relative to when nothing is selected.
  homeTarget: [number, number, number];
  homePosition: [number, number, number];
};

const FOCUS_OFFSET_DISTANCE = 9; // how close camera gets when focusing
const FOCUS_HEIGHT_OFFSET = 5;
const LERP_RATE = 3.0; // higher = faster

export function CameraController({
  positioned,
  homeTarget,
  homePosition,
}: Props) {
  const { camera, controls } = useThree() as {
    camera: THREE.PerspectiveCamera;
    controls: OrbitControlsImpl | null;
  };
  const selectedId = useSelectionStore((s) => s.selectedId);

  const lookup = useMemo(() => {
    const m = new Map<string, Positioned>();
    for (const p of positioned) m.set(p.file.id, p);
    return m;
  }, [positioned]);

  const desiredTarget = useRef(new THREE.Vector3(...homeTarget));
  const desiredPosition = useRef(new THREE.Vector3(...homePosition));
  const tmpDir = useRef(new THREE.Vector3());
  // We only animate the camera while a flight is in progress. Once it
  // arrives at the destination, OrbitControls takes back ownership so the
  // user can freely orbit without the lerp fighting their drag.
  const flyingRef = useRef(false);

  // When selection changes, compute a new desired camera target + position.
  useEffect(() => {
    if (!selectedId) {
      desiredTarget.current.set(...homeTarget);
      desiredPosition.current.set(...homePosition);
      flyingRef.current = true;
      return;
    }
    const p = lookup.get(selectedId);
    if (!p) return;
    const buildingTop = p.dims.height;
    const focusY = buildingTop * 0.55;
    const target = new THREE.Vector3(p.position[0], focusY, p.position[2]);

    // Keep the camera roughly in its current viewing direction, but pulled
    // close to the building so it fills the frame. Short buildings get a
    // larger pad so we don't drop the camera into the ground next to them.
    tmpDir.current
      .copy(camera.position)
      .sub(controls?.target ?? desiredTarget.current);
    if (tmpDir.current.lengthSq() < 1e-4) {
      tmpDir.current.set(1, 0.7, 1);
    }
    tmpDir.current.normalize();

    const distance = Math.max(
      FOCUS_OFFSET_DISTANCE,
      buildingTop * 1.8 + 5,
    );
    const pos = new THREE.Vector3()
      .copy(tmpDir.current)
      .multiplyScalar(distance)
      .add(target);
    pos.y = Math.max(pos.y, buildingTop + FOCUS_HEIGHT_OFFSET);

    desiredTarget.current.copy(target);
    desiredPosition.current.copy(pos);
    flyingRef.current = true;
  }, [selectedId, lookup, camera, controls, homePosition, homeTarget]);

  useFrame((_, dt) => {
    if (!controls || !flyingRef.current) return;
    const alpha = 1 - Math.exp(-LERP_RATE * dt);
    controls.target.lerp(desiredTarget.current, alpha);
    camera.position.lerp(desiredPosition.current, alpha);
    controls.update();

    if (
      camera.position.distanceTo(desiredPosition.current) < 0.04 &&
      controls.target.distanceTo(desiredTarget.current) < 0.04
    ) {
      flyingRef.current = false;
    }
  });

  return null;
}
