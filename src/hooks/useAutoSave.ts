import { useEffect, useRef } from 'react';
import { usePresetStore } from '@/stores/usePresetStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { useKeyframeStore } from '@/stores/useKeyframeStore';
import { useTimelineStore } from '@/stores/useTimelineStore';

const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

/**
 * Hook to handle auto-save and auto-load functionality
 * - Auto-saves to localStorage every 5 seconds when there are changes
 * - Loads auto-save on app startup
 * - Tracks changes to mark unsaved state
 */
export function useAutoSave() {
  const { autoSave, loadAutoSave, markUnsaved } = usePresetStore();
  const hasLoadedRef = useRef(false);
  const lastStateRef = useRef<string>('');

  // Load auto-save on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      const loaded = loadAutoSave();
      if (loaded) {
        console.log('[AutoSave] Loaded auto-saved state');
      }
      hasLoadedRef.current = true;

      // Store initial state
      lastStateRef.current = getCurrentStateHash();
    }
  }, [loadAutoSave]);

  // Track changes and auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      const currentHash = getCurrentStateHash();

      if (currentHash !== lastStateRef.current) {
        // State has changed, mark as unsaved and auto-save
        markUnsaved();
        autoSave();
        lastStateRef.current = currentHash;
        console.log('[AutoSave] State changed, auto-saved');
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [autoSave, markUnsaved]);
}

/**
 * Generate a hash of the current state to detect changes
 */
function getCurrentStateHash(): string {
  const configStore = useConfigStore.getState();
  const keyframeStore = useKeyframeStore.getState();
  const timelineStore = useTimelineStore.getState();

  const state = {
    config: {
      angle: configStore.angle,
      offset: configStore.offset,
      patternScale: configStore.patternScale,
      patternAngle: configStore.patternAngle,
      symmetries: configStore.symmetries,
      backgroundColor: configStore.backgroundColor,
      makeTilable: configStore.makeTilable,
      // Don't include patternImageData in hash as it's large
    },
    keyframes: keyframeStore.channels,
    timeline: {
      fps: keyframeStore.fps,
      loop: keyframeStore.loop,
      duration: timelineStore.duration,
    },
  };

  return JSON.stringify(state);
}
