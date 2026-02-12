import { create } from 'zustand';

interface TimelineState {
  // Playback state
  isPlaying: boolean;
  isRecording: boolean;
  currentFrame: number;
  duration: number;  // Timeline duration in frames

  // Timeline UI state
  zoom: number;
  scrollOffset: number;
  selectedKeyframeIndices: Set<number>;
  snapToKeyframes: boolean;

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  setPlaying: (playing: boolean) => void;
  setRecording: (recording: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  scrubTo: (frame: number) => void;
  setDuration: (duration: number) => void;

  // Timeline UI actions
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setScrollOffset: (offset: number) => void;
  selectKeyframe: (index: number, multiSelect?: boolean) => void;
  clearSelection: () => void;
  toggleSnapToKeyframes: () => void;
  frameAll: (totalFrames: number) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  isPlaying: false,
  isRecording: false,
  currentFrame: 0,
  duration: 300,  // Default duration of 300 frames

  zoom: 1,
  scrollOffset: 0,
  selectedKeyframeIndices: new Set(),
  snapToKeyframes: true,

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  stop: () => set({ isPlaying: false, currentFrame: 0 }),

  togglePlayPause: () => {
    const state = get();
    set({ isPlaying: !state.isPlaying });
  },

  setPlaying: (isPlaying) => set({ isPlaying }),

  setRecording: (isRecording) => set({ isRecording }),

  setCurrentFrame: (currentFrame) => {
    const state = get();
    set({ currentFrame: Math.max(0, Math.min(state.duration, currentFrame)) });
  },

  scrubTo: (frame) => {
    const state = get();
    set({ currentFrame: Math.max(0, Math.min(state.duration, frame)) });
  },

  setDuration: (duration) => {
    const state = get();
    set({
      duration: Math.max(1, duration),
      // Clamp current frame to new duration
      currentFrame: Math.min(state.currentFrame, duration)
    });
  },

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),

  zoomIn: () => {
    const state = get();
    set({ zoom: Math.min(10, state.zoom * 1.2) });
  },

  zoomOut: () => {
    const state = get();
    set({ zoom: Math.max(0.1, state.zoom / 1.2) });
  },

  setScrollOffset: (scrollOffset) => set({ scrollOffset }),

  selectKeyframe: (index, multiSelect = false) => {
    const state = get();
    const newSelection = new Set(multiSelect ? state.selectedKeyframeIndices : []);

    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }

    set({ selectedKeyframeIndices: newSelection });
  },

  clearSelection: () => set({ selectedKeyframeIndices: new Set() }),

  toggleSnapToKeyframes: () => {
    const state = get();
    set({ snapToKeyframes: !state.snapToKeyframes });
  },

  frameAll: (totalFrames) => {
    // Calculate zoom level to fit all frames in view
    // This will be implemented based on timeline viewport width
    const viewportWidth = window.innerWidth * 0.8;  // Approximate timeline width
    const frameWidth = 10;  // Minimum width per frame
    const requiredZoom = viewportWidth / (totalFrames * frameWidth);

    set({
      zoom: Math.max(0.1, Math.min(10, requiredZoom)),
      scrollOffset: 0,
    });
  },
}));
