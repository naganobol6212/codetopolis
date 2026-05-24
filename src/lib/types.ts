export type FileRole =
  | "entry"
  | "route"
  | "component"
  | "lib"
  | "config"
  | "test"
  | "type"
  | "other";

export type FileNode = {
  id: string;
  path: string;
  loc: number;
  functions: number;
  imports: string[];
  role: FileRole;
};

export type Edge = {
  from: string;
  to: string;
};

export type Codebase = {
  files: FileNode[];
  edges: Edge[];
  generatedAt: string;
};
