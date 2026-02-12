import { useEffect } from 'react';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useKeyframeStore } from '@/stores/useKeyframeStore';
import { useHistoryStore } from '@/stores/useHistoryStore';

export function useKeyboardShortcuts() {
  const { togglePlayPause, isPlaying, currentFrame } = useTimelineStore();
  const { channels, copySelectedKeyframes, pasteKeyframes } = useKeyframeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Handle Ctrl/Cmd key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c':
            // Copy selected keyframes
            e.preventDefault();
            copySelectedKeyframes();
            break;

          case 'v':
            // Paste keyframes at current frame
            e.preventDefault();
            pasteKeyframes(currentFrame);
            break;

          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              useHistoryStore.getState().redo();
            } else {
              useHistoryStore.getState().undo();
            }
            break;

          case 'y':
            e.preventDefault();
            useHistoryStore.getState().redo();
            break;

          default:
            break;
        }
        return;
      }

      switch (e.key) {
        case ' ':
          // Space: Play/Pause
          e.preventDefault();
          togglePlayPause();
          break;

        case 'Delete':
        case 'Backspace':
          // Delete: Remove selected keyframes
          e.preventDefault();
          useKeyframeStore.getState().deleteSelectedKeyframes();
          break;

        case 'Home':
          // Home: Go to start
          e.preventDefault();
          useTimelineStore.getState().setCurrentFrame(0);
          break;

        case 'End':
          // End: Go to end
          e.preventDefault();
          const { duration } = useTimelineStore.getState();
          useTimelineStore.getState().setCurrentFrame(duration);
          break;

        case 'ArrowLeft':
          // Left: Previous frame
          e.preventDefault();
          const currentLeft = useTimelineStore.getState().currentFrame;
          useTimelineStore.getState().setCurrentFrame(Math.max(0, currentLeft - 1));
          break;

        case 'ArrowRight':
          // Right: Next frame
          e.preventDefault();
          const { currentFrame, duration: dur } = useTimelineStore.getState();
          useTimelineStore.getState().setCurrentFrame(Math.min(dur, currentFrame + 1));
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, isPlaying, channels, currentFrame, copySelectedKeyframes, pasteKeyframes]);

  return null;
}
