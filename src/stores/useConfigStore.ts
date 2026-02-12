import { create } from 'zustand';
import { useHistoryStore } from './useHistoryStore';

// Helper function for randomization
const randomizeValue = (value: number, min: number, max: number, strength: number): number => {
  const newValue = Math.random() * (max - min) + min;
  return Math.min(max, Math.max(min, value + (newValue - value) * strength));
};

interface ConfigState {
  // Canvas parameters
  width: number;
  height: number;
  scale: number;
  angle: number;
  backgroundColor: string;

  // Pattern parameters
  offset: { x: number; y: number };
  patternScale: number;
  patternAngle: number;
  symmetries: number;
  makeTilable: boolean;

  // File
  file?: File;

  // Presets
  currentPreset: string;
  randomizeStrength: number;

  // Actions
  setParameter: <K extends keyof ConfigState>(key: K, value: ConfigState[K]) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setScale: (scale: number) => void;
  setAngle: (angle: number) => void;
  setBackgroundColor: (color: string) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  setPatternScale: (scale: number) => void;
  setPatternAngle: (angle: number) => void;
  setSymmetries: (symmetries: number) => void;
  setMakeTilable: (tilable: boolean) => void;
  setFile: (file?: File) => void;
  setCurrentPreset: (preset: string) => void;
  setRandomizeStrength: (strength: number) => void;
  randomize: () => void;
  importConfig: (config: Partial<ConfigState>) => void;
  exportConfig: () => Partial<ConfigState>;
  reset: () => void;
}

const DEFAULT_CONFIG = {
  width: 2048,
  height: 2048,
  scale: 4,
  angle: 0,
  backgroundColor: '#000',
  offset: { x: 0, y: 0 },
  patternScale: 1,
  patternAngle: 0,
  symmetries: 7,
  makeTilable: false,
  file: undefined,
  currentPreset: '',
  randomizeStrength: 1,
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  ...DEFAULT_CONFIG,

  setParameter: (key, value) => {
    useHistoryStore.getState().debouncedPushState();
    set({ [key]: value });
  },

  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setScale: (scale) => set({ scale }),
  setAngle: (angle) => {
    useHistoryStore.getState().debouncedPushState();
    set({ angle });
  },
  setBackgroundColor: (backgroundColor) => {
    useHistoryStore.getState().debouncedPushState();
    set({ backgroundColor });
  },
  setOffset: (offset) => {
    useHistoryStore.getState().debouncedPushState();
    set({ offset });
  },
  setPatternScale: (patternScale) => {
    useHistoryStore.getState().debouncedPushState();
    set({ patternScale });
  },
  setPatternAngle: (patternAngle) => {
    useHistoryStore.getState().debouncedPushState();
    set({ patternAngle });
  },
  setSymmetries: (symmetries) => {
    useHistoryStore.getState().debouncedPushState();
    set({ symmetries });
  },
  setMakeTilable: (makeTilable) => {
    useHistoryStore.getState().pushState();
    set({ makeTilable });
  },
  setFile: (file) => set({ file }),
  setCurrentPreset: (currentPreset) => set({ currentPreset }),
  setRandomizeStrength: (randomizeStrength) => set({ randomizeStrength }),

  randomize: () => {
    useHistoryStore.getState().pushState();
    const state = get();
    const strength = state.randomizeStrength;

    set({
      angle: randomizeValue(state.angle, -180, 180, strength),
      offset: {
        x: randomizeValue(state.offset.x, -1, 1, strength),
        y: randomizeValue(state.offset.y, -1, 1, strength),
      },
      patternScale: randomizeValue(state.patternScale, 0.1, 4, strength),
      patternAngle: randomizeValue(state.patternAngle, -180, 180, strength),
      symmetries: Math.floor(randomizeValue(state.symmetries, 1, 16, strength)),
    });
  },

  importConfig: (config) => {
    if (!useHistoryStore.getState().isRestoring) {
      useHistoryStore.getState().pushState();
    }
    set((state) => ({ ...state, ...config }));
  },

  exportConfig: () => {
    const state = get();
    return {
      width: state.width,
      height: state.height,
      scale: state.scale,
      angle: state.angle,
      backgroundColor: state.backgroundColor,
      offset: state.offset,
      patternScale: state.patternScale,
      patternAngle: state.patternAngle,
      symmetries: state.symmetries,
      makeTilable: state.makeTilable,
      randomizeStrength: state.randomizeStrength,
    };
  },

  reset: () => {
    useHistoryStore.getState().pushState();
    set(DEFAULT_CONFIG);
  },
}));
