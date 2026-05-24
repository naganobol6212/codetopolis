import type { FileNode } from "./types";

export type BuildingDims = {
  height: number;
  width: number;
};

export type Positioned = {
  file: FileNode;
  position: [number, number, number];
  dims: BuildingDims;
};

export function computeDims(file: FileNode): BuildingDims {
  const baseHeight = Math.max(0.5, file.loc / 20);
  const baseWidth = Math.max(0.8, Math.min(3, 0.8 + file.functions * 0.25));

  switch (file.role) {
    case "config":
      return { height: Math.min(baseHeight, 1.0), width: Math.max(baseWidth, 1.6) };
    case "test":
      return { height: baseHeight * 0.6, width: baseWidth };
    case "type":
      return { height: Math.min(baseHeight, 0.8), width: Math.max(baseWidth, 1.2) };
    case "entry":
      return { height: Math.max(baseHeight, 1.4), width: baseWidth };
    default:
      return { height: baseHeight, width: baseWidth };
  }
}

export function gridPosition(
  index: number,
  total: number,
  spacing: number,
): [number, number, number] {
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const offset = ((cols - 1) * spacing) / 2;
  return [col * spacing - offset, 0, row * spacing - offset];
}

export function layoutFiles(
  files: FileNode[],
  spacing: number,
): Positioned[] {
  return files.map((file, i) => ({
    file,
    position: gridPosition(i, files.length, spacing),
    dims: computeDims(file),
  }));
}
