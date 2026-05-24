import { create } from "zustand";

type SelectionState = {
  selectedId: string | null;
  hoveredId: string | null;
  visitedIds: Set<string>;
  setSelected: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  resetVisited: () => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,
  hoveredId: null,
  visitedIds: new Set<string>(),
  setSelected: (id) =>
    set((state) => {
      if (id && !state.visitedIds.has(id)) {
        const next = new Set(state.visitedIds);
        next.add(id);
        return { selectedId: id, visitedIds: next };
      }
      return { selectedId: id };
    }),
  setHovered: (id) => set({ hoveredId: id }),
  resetVisited: () => set({ visitedIds: new Set() }),
}));
