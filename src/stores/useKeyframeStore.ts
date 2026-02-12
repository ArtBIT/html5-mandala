import { create } from 'zustand';
import { useHistoryStore } from './useHistoryStore';

export type ParameterKey = 'angle' | 'offset.x' | 'offset.y' | 'patternScale' | 'patternAngle' | 'symmetries';

export interface ParameterKeyframe {
  time: number;
  value: number;
  easing: string | { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } };
}

export interface ParameterChannel {
  keyframes: ParameterKeyframe[];
  enabled: boolean; // Channel visibility toggle
}

interface CopiedKeyframe {
  param: ParameterKey;
  time: number;
  value: number;
  easing: string | { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } };
}

interface KeyframeState {
  channels: Record<ParameterKey, ParameterChannel>;
  fps: number;
  loop: boolean;
  selectedKeyframes: Set<string>; // Format: "param:time"
  clipboard: CopiedKeyframe[]; // Copied keyframes

  // Actions
  addKeyframe: (param: ParameterKey, time: number, value: number) => void;
  removeKeyframe: (param: ParameterKey, time: number) => void;
  updateKeyframe: (param: ParameterKey, time: number, value: number) => void;
  hasKeyframeAt: (param: ParameterKey, time: number) => boolean;
  getKeyframeAtTime: (param: ParameterKey, time: number) => ParameterKeyframe | null;
  getAllKeyframeTimes: () => number[];
  clearAllKeyframes: () => void;
  setFps: (fps: number) => void;
  setLoop: (loop: boolean) => void;
  importChannels: (channels: Record<ParameterKey, ParameterChannel>) => void;
  exportChannels: () => Record<ParameterKey, ParameterChannel>;

  // Selection
  selectKeyframe: (param: ParameterKey, time: number, multiSelect?: boolean) => void;
  deselectKeyframe: (param: ParameterKey, time: number) => void;
  clearSelection: () => void;
  isKeyframeSelected: (param: ParameterKey, time: number) => boolean;
  deleteSelectedKeyframes: () => void;

  // Clipboard
  copySelectedKeyframes: () => void;
  pasteKeyframes: (atTime: number) => void;

  // Drag
  moveKeyframe: (param: ParameterKey, oldTime: number, newTime: number) => void;

  // Easing
  updateKeyframeEasing: (
    param: ParameterKey,
    time: number,
    easing: string | { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } }
  ) => void;

  // Channel visibility
  toggleChannelVisibility: (param: ParameterKey) => void;
  isChannelEnabled: (param: ParameterKey) => boolean;
}

const createDefaultChannels = (): Record<ParameterKey, ParameterChannel> => ({
  'angle': { keyframes: [{ time: 0, value: 0, easing: 'linear' }], enabled: true },
  'offset.x': { keyframes: [{ time: 0, value: 0, easing: 'linear' }], enabled: true },
  'offset.y': { keyframes: [{ time: 0, value: 0, easing: 'linear' }], enabled: true },
  'patternScale': { keyframes: [{ time: 0, value: 1, easing: 'linear' }], enabled: true },
  'patternAngle': { keyframes: [{ time: 0, value: 0, easing: 'linear' }], enabled: true },
  'symmetries': { keyframes: [{ time: 0, value: 7, easing: 'linear' }], enabled: true },
});

export const useKeyframeStore = create<KeyframeState>((set, get) => ({
  channels: createDefaultChannels(),
  fps: 30,
  loop: false,
  selectedKeyframes: new Set<string>(),
  clipboard: [],

  addKeyframe: (param, time, value) => {
    useHistoryStore.getState().pushState();
    const state = get();
    const channel = state.channels[param];

    // Check if keyframe already exists at this time
    const existingIndex = channel.keyframes.findIndex(kf => Math.abs(kf.time - time) <= 0.5);

    if (existingIndex !== -1) {
      // Update existing keyframe
      const newKeyframes = [...channel.keyframes];
      newKeyframes[existingIndex] = { ...newKeyframes[existingIndex], value };

      set({
        channels: {
          ...state.channels,
          [param]: { ...channel, keyframes: newKeyframes },
        },
      });
    } else {
      // Add new keyframe and sort by time
      const newKeyframes = [
        ...channel.keyframes,
        { time, value, easing: 'linear' },
      ].sort((a, b) => a.time - b.time);

      set({
        channels: {
          ...state.channels,
          [param]: { ...channel, keyframes: newKeyframes },
        },
      });
    }
  },

  removeKeyframe: (param, time) => {
    useHistoryStore.getState().pushState();
    const state = get();
    const channel = state.channels[param];

    const newKeyframes = channel.keyframes.filter(kf => Math.abs(kf.time - time) > 0.5);

    set({
      channels: {
        ...state.channels,
        [param]: { ...channel, keyframes: newKeyframes },
      },
    });
  },

  updateKeyframe: (param, time, value) => {
    useHistoryStore.getState().debouncedPushState();
    const state = get();
    const channel = state.channels[param];

    const keyframeIndex = channel.keyframes.findIndex(kf => Math.abs(kf.time - time) <= 0.5);

    if (keyframeIndex !== -1) {
      const newKeyframes = [...channel.keyframes];
      newKeyframes[keyframeIndex] = { ...newKeyframes[keyframeIndex], value };

      set({
        channels: {
          ...state.channels,
          [param]: { ...channel, keyframes: newKeyframes },
        },
      });
    }
  },

  clearAllKeyframes: () => {
    useHistoryStore.getState().pushState();
    set({ channels: createDefaultChannels() });
  },

  setFps: (fps) => set({ fps: Math.max(1, Math.min(60, fps)) }),

  setLoop: (loop) => set({ loop }),

  hasKeyframeAt: (param, time) => {
    const state = get();
    const channel = state.channels[param];
    return channel.keyframes.some(kf => Math.abs(kf.time - time) <= 0.5);
  },

  getKeyframeAtTime: (param, time) => {
    const state = get();
    const channel = state.channels[param];
    const keyframe = channel.keyframes.find(kf => Math.abs(kf.time - time) <= 0.5);
    return keyframe || null;
  },

  getAllKeyframeTimes: () => {
    const state = get();
    const allTimes = new Set<number>();

    Object.values(state.channels).forEach(channel => {
      channel.keyframes.forEach(kf => {
        allTimes.add(kf.time);
      });
    });

    return Array.from(allTimes).sort((a, b) => a - b);
  },

  importChannels: (channels) => {
    if (!useHistoryStore.getState().isRestoring) {
      useHistoryStore.getState().pushState();
    }
    set({ channels });
  },

  exportChannels: () => {
    return get().channels;
  },

  // Selection methods
  selectKeyframe: (param, time, multiSelect = false) => {
    const state = get();
    const key = `${param}:${time}`;
    const newSelection = new Set(multiSelect ? state.selectedKeyframes : []);

    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }

    set({ selectedKeyframes: newSelection });
  },

  deselectKeyframe: (param, time) => {
    const state = get();
    const key = `${param}:${time}`;
    const newSelection = new Set(state.selectedKeyframes);
    newSelection.delete(key);
    set({ selectedKeyframes: newSelection });
  },

  clearSelection: () => {
    set({ selectedKeyframes: new Set() });
  },

  isKeyframeSelected: (param, time) => {
    const state = get();
    const key = `${param}:${time}`;
    return state.selectedKeyframes.has(key);
  },

  deleteSelectedKeyframes: () => {
    useHistoryStore.getState().pushState();
    const state = get();
    const newChannels = { ...state.channels };

    state.selectedKeyframes.forEach(key => {
      const [param, timeStr] = key.split(':');
      const time = parseFloat(timeStr);
      const channel = newChannels[param as ParameterKey];

      if (channel) {
        channel.keyframes = channel.keyframes.filter(
          kf => Math.abs(kf.time - time) > 0.5
        );
      }
    });

    set({
      channels: newChannels,
      selectedKeyframes: new Set(),
    });
  },

  // Clipboard methods
  copySelectedKeyframes: () => {
    const state = get();
    const copied: CopiedKeyframe[] = [];

    state.selectedKeyframes.forEach(key => {
      const [param, timeStr] = key.split(':');
      const time = parseFloat(timeStr);
      const keyframe = state.channels[param as ParameterKey].keyframes.find(
        kf => Math.abs(kf.time - time) <= 0.5
      );

      if (keyframe) {
        copied.push({
          param: param as ParameterKey,
          time: keyframe.time,
          value: keyframe.value,
          easing: keyframe.easing,
        });
      }
    });

    set({ clipboard: copied });
  },

  pasteKeyframes: (atTime: number) => {
    useHistoryStore.getState().pushState();
    const state = get();
    if (state.clipboard.length === 0) return;

    // Find the earliest time in clipboard to use as offset reference
    const minTime = Math.min(...state.clipboard.map(kf => kf.time));
    const offset = atTime - minTime;

    const newChannels = { ...state.channels };
    const newSelection = new Set<string>();

    state.clipboard.forEach(copied => {
      const newTime = copied.time + offset;
      const channel = newChannels[copied.param];

      if (channel) {
        // Check if keyframe already exists at this time
        const existingIndex = channel.keyframes.findIndex(
          kf => Math.abs(kf.time - newTime) <= 0.5
        );

        if (existingIndex !== -1) {
          // Update existing keyframe
          channel.keyframes[existingIndex] = {
            ...channel.keyframes[existingIndex],
            value: copied.value,
            easing: copied.easing,
          };
        } else {
          // Add new keyframe
          channel.keyframes = [...channel.keyframes, {
            time: newTime,
            value: copied.value,
            easing: copied.easing,
          }].sort((a, b) => a.time - b.time);
        }

        // Select the pasted keyframe
        newSelection.add(`${copied.param}:${newTime}`);
      }
    });

    set({
      channels: newChannels,
      selectedKeyframes: newSelection,
    });
  },

  // Drag methods
  moveKeyframe: (param, oldTime, newTime) => {
    useHistoryStore.getState().debouncedPushState();
    const state = get();
    const channel = state.channels[param];

    // Find the keyframe at oldTime
    const keyframeIndex = channel.keyframes.findIndex(
      kf => Math.abs(kf.time - oldTime) <= 0.5
    );

    if (keyframeIndex === -1) return;

    const keyframe = channel.keyframes[keyframeIndex];
    const newChannels = { ...state.channels };

    // Remove from old position
    newChannels[param].keyframes = channel.keyframes.filter(
      (_, i) => i !== keyframeIndex
    );

    // Check if there's already a keyframe at the new time
    const existingIndex = newChannels[param].keyframes.findIndex(
      kf => Math.abs(kf.time - newTime) <= 0.5
    );

    if (existingIndex !== -1) {
      // Replace existing keyframe
      newChannels[param].keyframes[existingIndex] = {
        ...keyframe,
        time: newTime,
      };
    } else {
      // Add at new position and sort
      newChannels[param].keyframes = [
        ...newChannels[param].keyframes,
        { ...keyframe, time: newTime },
      ].sort((a, b) => a.time - b.time);
    }

    // Update selection to new time
    const oldKey = `${param}:${oldTime}`;
    const newKey = `${param}:${newTime}`;
    const newSelection = new Set(state.selectedKeyframes);

    if (newSelection.has(oldKey)) {
      newSelection.delete(oldKey);
      newSelection.add(newKey);
    }

    set({
      channels: newChannels,
      selectedKeyframes: newSelection,
    });
  },

  // Update keyframe easing
  updateKeyframeEasing: (param, time, easing) => {
    useHistoryStore.getState().pushState();
    const state = get();
    const channel = state.channels[param];

    const keyframeIndex = channel.keyframes.findIndex(
      kf => Math.abs(kf.time - time) <= 0.5
    );

    if (keyframeIndex === -1) return;

    const newChannels = { ...state.channels };
    newChannels[param].keyframes = [...channel.keyframes];
    newChannels[param].keyframes[keyframeIndex] = {
      ...channel.keyframes[keyframeIndex],
      easing,
    };

    set({ channels: newChannels });
  },

  // Channel visibility
  toggleChannelVisibility: (param) => {
    useHistoryStore.getState().pushState();
    const state = get();
    const newChannels = { ...state.channels };
    newChannels[param] = {
      ...newChannels[param],
      enabled: !newChannels[param].enabled,
    };
    set({ channels: newChannels });
  },

  isChannelEnabled: (param) => {
    return get().channels[param].enabled;
  },
}));
