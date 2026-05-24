"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
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
  points: [[number, number, number], [number, number, number]];
};

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
      const start: [number, number, number] = [
        a.position[0],
        a.dims.height,
        a.position[2],
      ];
      const end: [number, number, number] = [
        b.position[0],
        b.dims.height,
        b.position[2],
      ];
      out.push({
        key: `${e.from}->${e.to}#${i}`,
        from: e.from,
        to: e.to,
        points: [start, end],
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
            points={r.points}
            color={isActive ? "#7dd3fc" : "#1e293b"}
            lineWidth={isActive ? 2.5 : 1}
            transparent
            opacity={isDimmed ? 0.08 : isActive ? 1 : 0.35}
          />
        );
      })}
    </group>
  );
}
