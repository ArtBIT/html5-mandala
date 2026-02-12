import { create } from 'zustand';
import { useConfigStore } from './useConfigStore';
import { useKeyframeStore, type ParameterKey, type ParameterChannel } from './useKeyframeStore';

interface ConfigSnapshot {
  angle: number;
  backgroundColor: string;
  offset: { x: number; y: number };
  patternScale: number;
  patternAngle: number;
  symmetries: number;
  makeTilable: boolean;
}

interface Snapshot {
  config: ConfigSnapshot;
  channels: Record<ParameterKey, ParameterChannel>;
}

const MAX_HISTORY = 50;
const THROTTLE_MS = 300;

let lastPushTime = 0;
let pendingPush: ReturnType<typeof setTimeout> | null = null;

// Global flag to skip history pushes (used by animation and restore logic)
let skipHistory = false;

export function setSkipHistory(skip: boolean) {
  skipHistory = skip;
}

export function batch(fn: () => void) {
  useHistoryStore.getState().pushState();
  skipHistory = true;
  try {
    fn();
  } finally {
    skipHistory = false;
  }
}

interface HistoryState {
  past: Snapshot[];
  future: Snapshot[];
  isRestoring: boolean;

  pushState: () => void;
  debouncedPushState: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function captureSnapshot(): Snapshot {
  const config = useConfigStore.getState();
  const keyframes = useKeyframeStore.getState();

  return {
    config: {
      angle: config.angle,
      backgroundColor: config.backgroundColor,
      offset: { ...config.offset },
      patternScale: config.patternScale,
      patternAngle: config.patternAngle,
      symmetries: config.symmetries,
      makeTilable: config.makeTilable,
    },
    channels: JSON.parse(JSON.stringify(keyframes.channels)),
  };
}

function applySnapshot(snapshot: Snapshot) {
  useConfigStore.getState().importConfig(snapshot.config);
  useKeyframeStore.getState().importChannels(
    JSON.parse(JSON.stringify(snapshot.channels))
  );
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  isRestoring: false,

  pushState: () => {
    if (get().isRestoring || skipHistory) return;

    if (pendingPush) {
      clearTimeout(pendingPush);
      pendingPush = null;
    }
    lastPushTime = Date.now();

    const current = captureSnapshot();
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), current],
      future: [],
    }));
  },

  debouncedPushState: () => {
    if (get().isRestoring || skipHistory) return;

    const now = Date.now();
    if (now - lastPushTime >= THROTTLE_MS) {
      get().pushState();
      return;
    }

    if (pendingPush) clearTimeout(pendingPush);
    pendingPush = setTimeout(() => {
      pendingPush = null;
      get().pushState();
    }, THROTTLE_MS);
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;

    const current = captureSnapshot();
    const previous = past[past.length - 1];

    set({ isRestoring: true, past: past.slice(0, -1), future: [current, ...get().future] });
    applySnapshot(previous);
    set({ isRestoring: false });
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;

    const current = captureSnapshot();
    const next = future[0];

    set({ isRestoring: true, past: [...get().past, current], future: future.slice(1) });
    applySnapshot(next);
    set({ isRestoring: false });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
