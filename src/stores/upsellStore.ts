import { create } from "zustand";

interface UpsellState {
  open: boolean;
  lastItemTitle: string | null;
  show: (title: string) => void;
  close: () => void;
}

export const useUpsellStore = create<UpsellState>((set) => ({
  open: false,
  lastItemTitle: null,
  show: (title) => set({ open: true, lastItemTitle: title }),
  close: () => set({ open: false }),
}));
