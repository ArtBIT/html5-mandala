import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  // Panel states
  controlsPanelWidth: number;
  controlsPanelCollapsed: boolean;
  timelineHeight: number;
  timelineCollapsed: boolean;

  // Actions
  setControlsPanelWidth: (width: number) => void;
  toggleControlsPanel: () => void;
  setTimelineHeight: (height: number) => void;
  toggleTimeline: () => void;
  resetLayout: () => void;
}

const DEFAULT_LAYOUT = {
  controlsPanelWidth: 380,
  controlsPanelCollapsed: false,
  timelineHeight: 250,
  timelineCollapsed: false,
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      ...DEFAULT_LAYOUT,

      setControlsPanelWidth: (width) =>
        set({ controlsPanelWidth: Math.max(320, Math.min(600, width)) }),

      toggleControlsPanel: () =>
        set((state) => ({ controlsPanelCollapsed: !state.controlsPanelCollapsed })),

      setTimelineHeight: (height) =>
        set({ timelineHeight: Math.max(150, Math.min(500, height)) }),

      toggleTimeline: () =>
        set((state) => ({ timelineCollapsed: !state.timelineCollapsed })),

      resetLayout: () => set(DEFAULT_LAYOUT),
    }),
    {
      name: 'mandala-layout-storage',
    }
  )
);
