import type { FileRole } from "./types";

export type RoleStyle = {
  color: string;
  label: string;
  description: string;
};

export const ROLE_STYLES: Record<FileRole, RoleStyle> = {
  entry: {
    color: "#fbbf24",
    label: "Entry",
    description: "page / layout / script",
  },
  route: {
    color: "#fb923c",
    label: "Route",
    description: "API handler",
  },
  component: {
    color: "#a78bfa",
    label: "Component",
    description: "UI building block",
  },
  lib: {
    color: "#22d3ee",
    label: "Lib",
    description: "utility / hook",
  },
  config: {
    color: "#64748b",
    label: "Config",
    description: "configuration",
  },
  test: {
    color: "#475569",
    label: "Test",
    description: "spec / fixture",
  },
  type: {
    color: "#94a3b8",
    label: "Type",
    description: "declaration",
  },
  other: {
    color: "#6b7280",
    label: "Other",
    description: "uncategorized",
  },
};

export const ROLE_ORDER: FileRole[] = [
  "entry",
  "route",
  "component",
  "lib",
  "type",
  "config",
  "test",
  "other",
];

export function roleColor(role: FileRole): string {
  return ROLE_STYLES[role].color;
}

export function roleLabel(role: FileRole): string {
  return ROLE_STYLES[role].label;
}
