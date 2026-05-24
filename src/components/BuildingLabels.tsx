"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import type { Positioned } from "@/lib/layout";
import { useSelectionStore } from "@/lib/store";

type Props = {
  positioned: Positioned[];
};

function locToAccent(loc: number): string {
  if (loc < 50) return "#22d3ee";
  if (loc < 150) return "#a78bfa";
  if (loc < 400) return "#f472b6";
  return "#ef4444";
}

export function BuildingLabels({ positioned }: Props) {
  const hoveredId = useSelectionStore((s) => s.hoveredId);
  const selectedId = useSelectionStore((s) => s.selectedId);

  const byId = useMemo(() => {
    const m = new Map<string, Positioned>();
    for (const p of positioned) m.set(p.file.id, p);
    return m;
  }, [positioned]);

  const hovered = hoveredId ? byId.get(hoveredId) : null;
  const selected = selectedId ? byId.get(selectedId) : null;

  // Suppress hover label when the same building is already selected — the
  // bigger selection label takes precedence.
  const showHover = hovered && hovered.file.id !== selectedId;

  return (
    <>
      {showHover && <HoverTooltip p={hovered} />}
      {selected && <SelectionLabel p={selected} />}
    </>
  );
}

function HoverTooltip({ p }: { p: Positioned }) {
  const [x, , z] = p.position;
  const y = p.dims.height + 0.4;
  const fileName = p.file.path.split("/").pop() ?? p.file.path;
  const accent = locToAccent(p.file.loc);

  return (
    <Html
      position={[x, y, z]}
      center
      distanceFactor={14}
      zIndexRange={[40, 30]}
      pointerEvents="none"
      style={{ pointerEvents: "none" }}
    >
      <div className="pointer-events-none -translate-y-1/2 select-none whitespace-nowrap">
        <div
          className="glass flex items-center gap-2 rounded-md px-2 py-1 font-mono text-[11px] leading-none text-foreground shadow-lg"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: accent, color: accent }}
          />
          <span className="font-medium">{fileName}</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="tabular-nums text-[var(--text-muted)]">
            {p.file.loc} loc
          </span>
        </div>
      </div>
    </Html>
  );
}

function SelectionLabel({ p }: { p: Positioned }) {
  const [x, , z] = p.position;
  const y = p.dims.height + 0.9;
  const fileName = p.file.path.split("/").pop() ?? p.file.path;
  const accent = locToAccent(p.file.loc);

  return (
    <Html
      position={[x, y, z]}
      center
      distanceFactor={10}
      zIndexRange={[60, 50]}
      pointerEvents="none"
      style={{ pointerEvents: "none" }}
    >
      <div className="pointer-events-none flex -translate-y-1/2 flex-col items-center select-none">
        {/* Tether line down to the building */}
        <div
          className="h-3 w-px"
          style={{
            background: `linear-gradient(180deg, ${accent}, transparent)`,
          }}
        />
        <div
          className="glass-strong relative overflow-hidden rounded-lg px-3 py-1.5 shadow-2xl"
          style={{
            boxShadow: `0 0 24px -4px ${accent}55, 0 8px 24px -8px rgba(0,0,0,0.8)`,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
          />
          <div className="flex items-center gap-2 font-mono text-[12px] leading-none">
            <span
              className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: accent, color: accent }}
            />
            <span className="font-semibold text-foreground">{fileName}</span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[10px] tabular-nums text-[var(--text-muted)]">
            <span>
              <span className="text-foreground/80">{p.file.loc}</span> loc
            </span>
            <span className="text-[var(--text-faint)]">·</span>
            <span>
              <span className="text-foreground/80">{p.file.functions}</span> fn
            </span>
          </div>
        </div>
      </div>
    </Html>
  );
}
