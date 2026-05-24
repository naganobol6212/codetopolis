"use client";

import { useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Edge } from "@/lib/types";
import type { Positioned } from "@/lib/layout";
import { useSelectionStore } from "@/lib/store";

type Props = {
  edges: Edge[];
  positioned: Positioned[];
};

type Resolved = {
  key: string;
  from: string;
  to: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  mid: THREE.Vector3;
  pathPoints: [number, number, number][];
};

const PARTICLES_PER_EDGE = 3;
const PARTICLE_SPEED = 0.22; // units of t per second
const ARC_HEIGHT_RATIO = 0.32; // fraction of edge length to arc upward

function quadraticBezier(
  out: THREE.Vector3,
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  t: number,
) {
  const inv = 1 - t;
  out.x = inv * inv * a.x + 2 * inv * t * b.x + t * t * c.x;
  out.y = inv * inv * a.y + 2 * inv * t * b.y + t * t * c.y;
  out.z = inv * inv * a.z + 2 * inv * t * b.z + t * t * c.z;
}

export function DependencyLines({ edges, positioned }: Props) {
  const selectedId = useSelectionStore((s) => s.selectedId);
  const hoveredId = useSelectionStore((s) => s.hoveredId);
  const activeId = selectedId ?? hoveredId;

  const lookup = useMemo(() => {
    const map = new Map<string, Positioned>();
    for (const p of positioned) map.set(p.file.id, p);
    return map;
  }, [positioned]);

  const resolved = useMemo<Resolved[]>(() => {
    const out: Resolved[] = [];
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const a = lookup.get(e.from);
      const b = lookup.get(e.to);
      if (!a || !b) continue;

      const start = new THREE.Vector3(
        a.position[0],
        a.dims.height,
        a.position[2],
      );
      const end = new THREE.Vector3(
        b.position[0],
        b.dims.height,
        b.position[2],
      );
      const dist = start.distanceTo(end);
      const arcLift = Math.min(6, dist * ARC_HEIGHT_RATIO);
      const mid = new THREE.Vector3(
        (start.x + end.x) / 2,
        Math.max(start.y, end.y) + arcLift,
        (start.z + end.z) / 2,
      );

      // Sample the curve into segments so the Line follows the arc, not a chord.
      const samples = 24;
      const tmp = new THREE.Vector3();
      const pathPoints: [number, number, number][] = [];
      for (let s = 0; s <= samples; s++) {
        quadraticBezier(tmp, start, mid, end, s / samples);
        pathPoints.push([tmp.x, tmp.y, tmp.z]);
      }

      out.push({
        key: `${e.from}->${e.to}#${i}`,
        from: e.from,
        to: e.to,
        start,
        end,
        mid,
        pathPoints,
      });
    }
    return out;
  }, [edges, lookup]);

  return (
    <group>
      {resolved.map((r) => {
        const isActive =
          activeId !== null && (activeId === r.from || activeId === r.to);
        const isDimmed = activeId !== null && !isActive;
        return (
          <Line
            key={r.key}
            points={r.pathPoints}
            color={isActive ? "#7dd3fc" : "#1e293b"}
            lineWidth={isActive ? 2.2 : 1}
            transparent
            opacity={isDimmed ? 0.06 : isActive ? 1 : 0.28}
          />
        );
      })}
      <FlowParticles edges={resolved} activeId={activeId} />
    </group>
  );
}

function FlowParticles({
  edges,
  activeId,
}: {
  edges: Resolved[];
  activeId: string | null;
}) {
  const total = edges.length * PARTICLES_PER_EDGE;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorRef = useRef<THREE.InstancedBufferAttribute>(null);

  // Per-instance phase offsets so particles don't all bunch at t=0.
  const phases = useMemo(() => {
    const arr = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const indexWithinEdge = i % PARTICLES_PER_EDGE;
      arr[i] = indexWithinEdge / PARTICLES_PER_EDGE + Math.random() * 0.05;
    }
    return arr;
  }, [total]);

  // Static per-instance colors (active dye is applied at runtime via tint).
  const colorArray = useMemo(() => new Float32Array(total * 3), [total]);

  const tmpObject = useMemo(() => new THREE.Object3D(), []);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const baseColor = useMemo(() => new THREE.Color("#7dd3fc"), []);
  const activeColor = useMemo(() => new THREE.Color("#fde68a"), []);
  const dimColor = useMemo(() => new THREE.Color("#1e3a5f"), []);

  useFrame((state, dt) => {
    const mesh = meshRef.current;
    if (!mesh || edges.length === 0) return;
    const time = state.clock.elapsedTime;

    for (let e = 0; e < edges.length; e++) {
      const edge = edges[e];
      const involved =
        activeId !== null && (activeId === edge.from || activeId === edge.to);
      const dimmed = activeId !== null && !involved;

      for (let p = 0; p < PARTICLES_PER_EDGE; p++) {
        const i = e * PARTICLES_PER_EDGE + p;
        // Phase + time * speed, wrapped to [0, 1).
        let t = (phases[i] + time * PARTICLE_SPEED) % 1;
        if (t < 0) t += 1;

        quadraticBezier(tmpVec, edge.start, edge.mid, edge.end, t);
        tmpObject.position.copy(tmpVec);

        // Particles fade in/out near edge endpoints — softer than hard pop.
        const fade =
          t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1;
        const baseScale = involved ? 0.18 : 0.075;
        const s = baseScale * (0.7 + 0.3 * fade);
        tmpObject.scale.setScalar(s);
        tmpObject.updateMatrix();
        mesh.setMatrixAt(i, tmpObject.matrix);

        if (dimmed) tmpColor.copy(dimColor).multiplyScalar(0.3);
        else if (involved) tmpColor.copy(activeColor).multiplyScalar(0.9);
        else tmpColor.copy(baseColor).multiplyScalar(0.5);
        // multiply by fade for soft endpoints
        tmpColor.multiplyScalar(0.4 + 0.6 * fade);
        tmpColor.toArray(colorArray, i * 3);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (colorRef.current) colorRef.current.needsUpdate = true;
    // suppress unused
    void baseColor;
    void dt;
  });

  if (total === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, total]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
      <instancedBufferAttribute
        ref={colorRef}
        attach="instanceColor"
        args={[colorArray, 3]}
      />
    </instancedMesh>
  );
}
