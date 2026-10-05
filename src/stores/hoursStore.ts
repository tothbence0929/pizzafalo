import { create } from "zustand";

interface HoursState {
  /** null = még nem ellenőriztük */
  open: boolean | null;
  todayOpen: string | null;
  todayClose: string | null;
  setStatus: (open: boolean, todayOpen?: string | null, todayClose?: string | null) => void;
}

export const useHoursStore = create<HoursState>()((set) => ({
  open: null,
  todayOpen: null,
  todayClose: null,
  setStatus: (open, todayOpen = null, todayClose = null) => set({ open, todayOpen, todayClose }),
}));
