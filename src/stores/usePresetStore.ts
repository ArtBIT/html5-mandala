import { create } from 'zustand';
import { useConfigStore } from './useConfigStore';
import { useKeyframeStore } from './useKeyframeStore';
import { useTimelineStore } from './useTimelineStore';
import { defaultPresets } from '@/data/defaultPresets';

const PRESETS_STORAGE_KEY = 'html5-mandala-presets';
const AUTOSAVE_STORAGE_KEY = 'html5-mandala-autosave';

export interface PresetData {
  name: string;
  timestamp: number;
  config: any; // Config state
  keyframes: any; // Keyframe channels
  timeline: {
    fps: number;
    loop: boolean;
    duration: number;
  };
}

interface PresetState {
  presets: Record<string, PresetData>;
  currentPresetName: string | null;
  hasUnsavedChanges: boolean;

  // Actions
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
  renamePreset: (oldName: string, newName: string) => void;
  getPresetNames: () => string[];

  // Auto-save
  autoSave: () => void;
  loadAutoSave: () => boolean;

  // Import/Export
  exportPreset: (name: string) => string;
  importPreset: (jsonString: string) => void;
  exportAllPresets: () => string;
  importAllPresets: (jsonString: string) => void;

  // Built-in presets
  isBuiltInPreset: (name: string) => boolean;

  // State management
  setCurrentPreset: (name: string | null) => void;
  markUnsaved: () => void;
  markSaved: () => void;
}

const getCurrentState = (): Omit<PresetData, 'name' | 'timestamp'> => {
  const configStore = useConfigStore.getState();
  const keyframeStore = useKeyframeStore.getState();
  const timelineStore = useTimelineStore.getState();

  return {
    config: {
      width: configStore.width,
      height: configStore.height,
      scale: configStore.scale,
      angle: configStore.angle,
      backgroundColor: configStore.backgroundColor,
      offset: configStore.offset,
      patternScale: configStore.patternScale,
      patternAngle: configStore.patternAngle,
      symmetries: configStore.symmetries,
      makeTilable: configStore.makeTilable,
    },
    keyframes: keyframeStore.exportChannels(),
    timeline: {
      fps: keyframeStore.fps,
      loop: keyframeStore.loop,
      duration: timelineStore.duration,
    },
  };
};

const applyState = (data: Omit<PresetData, 'name' | 'timestamp'>) => {
  const configStore = useConfigStore.getState();
  const keyframeStore = useKeyframeStore.getState();
  const timelineStore = useTimelineStore.getState();

  // Apply config
  if (data.config) {
    Object.entries(data.config).forEach(([key, value]) => {
      if (key === 'offset') {
        configStore.setOffset(value as any);
      } else if (key === 'patternImageData') {
        // Skip deprecated patternImageData field
        // Pattern is loaded via file upload, not stored in presets
      } else {
        const setter = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (typeof (configStore as any)[setter] === 'function') {
          (configStore as any)[setter](value);
        }
      }
    });
  }

  // Apply keyframes
  if (data.keyframes) {
    keyframeStore.importChannels(data.keyframes);
  }

  // Apply timeline settings
  if (data.timeline) {
    keyframeStore.setFps(data.timeline.fps);
    keyframeStore.setLoop(data.timeline.loop);
    timelineStore.setDuration(data.timeline.duration);
  }
};

const loadPresetsFromStorage = (): Record<string, PresetData> => {
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load presets from localStorage:', e);
  }
  return {};
};

const savePresetsToStorage = (presets: Record<string, PresetData>) => {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save presets to localStorage:', e);
  }
};

export const usePresetStore = create<PresetState>((set, get) => ({
  presets: loadPresetsFromStorage(),
  currentPresetName: null,
  hasUnsavedChanges: false,

  savePreset: (name: string) => {
    const state = get();
    const currentState = getCurrentState();

    const preset: PresetData = {
      name,
      timestamp: Date.now(),
      ...currentState,
    };

    const newPresets = {
      ...state.presets,
      [name]: preset,
    };

    savePresetsToStorage(newPresets);

    set({
      presets: newPresets,
      currentPresetName: name,
      hasUnsavedChanges: false,
    });
  },

  loadPreset: (name: string) => {
    const state = get();
    const preset = state.presets[name] || defaultPresets[name];

    if (!preset) {
      console.error(`Preset "${name}" not found`);
      return;
    }

    applyState(preset);

    set({
      currentPresetName: name,
      hasUnsavedChanges: false,
    });
  },

  deletePreset: (name: string) => {
    const state = get();
    const newPresets = { ...state.presets };
    delete newPresets[name];

    savePresetsToStorage(newPresets);

    set({
      presets: newPresets,
      currentPresetName: state.currentPresetName === name ? null : state.currentPresetName,
    });
  },

  renamePreset: (oldName: string, newName: string) => {
    const state = get();
    const preset = state.presets[oldName];

    if (!preset) {
      console.error(`Preset "${oldName}" not found`);
      return;
    }

    const newPresets = { ...state.presets };
    delete newPresets[oldName];
    newPresets[newName] = { ...preset, name: newName };

    savePresetsToStorage(newPresets);

    set({
      presets: newPresets,
      currentPresetName: state.currentPresetName === oldName ? newName : state.currentPresetName,
    });
  },

  getPresetNames: () => {
    const userNames = Object.keys(get().presets);
    const builtInNames = Object.keys(defaultPresets);
    const allNames = new Set([...builtInNames, ...userNames]);
    return Array.from(allNames).sort();
  },

  isBuiltInPreset: (name: string) => {
    return name in defaultPresets;
  },

  autoSave: () => {
    const currentState = getCurrentState();
    const autoSaveData = {
      name: '_autosave',
      timestamp: Date.now(),
      ...currentState,
    };

    try {
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(autoSaveData));
    } catch (e) {
      console.error('Failed to auto-save:', e);
    }
  },

  loadAutoSave: () => {
    try {
      const stored = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (stored) {
        const autoSaveData = JSON.parse(stored);
        applyState(autoSaveData);
        set({ hasUnsavedChanges: false });
        return true;
      }
    } catch (e) {
      console.error('Failed to load auto-save:', e);
    }
    return false;
  },

  exportPreset: (name: string) => {
    const state = get();
    const preset = state.presets[name] || defaultPresets[name];

    if (!preset) {
      throw new Error(`Preset "${name}" not found`);
    }

    return JSON.stringify(preset, null, 2);
  },

  importPreset: (jsonString: string) => {
    try {
      const preset: PresetData = JSON.parse(jsonString);

      if (!preset.name) {
        throw new Error('Invalid preset: missing name');
      }

      const state = get();
      const newPresets = {
        ...state.presets,
        [preset.name]: preset,
      };

      savePresetsToStorage(newPresets);
      set({ presets: newPresets });

    } catch (e) {
      console.error('Failed to import preset:', e);
      throw e;
    }
  },

  exportAllPresets: () => {
    const state = get();
    return JSON.stringify(state.presets, null, 2);
  },

  importAllPresets: (jsonString: string) => {
    try {
      const presets: Record<string, PresetData> = JSON.parse(jsonString);

      savePresetsToStorage(presets);
      set({ presets });

    } catch (e) {
      console.error('Failed to import presets:', e);
      throw e;
    }
  },

  setCurrentPreset: (name: string | null) => {
    set({ currentPresetName: name });
  },

  markUnsaved: () => {
    set({ hasUnsavedChanges: true });
  },

  markSaved: () => {
    set({ hasUnsavedChanges: false });
  },
}));
