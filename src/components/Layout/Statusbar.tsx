import { useConfigStore } from '@/stores/useConfigStore';
import { useKeyframeStore } from '@/stores/useKeyframeStore';
import { useTimelineStore } from '@/stores/useTimelineStore';

export function Statusbar() {
  const { width, height } = useConfigStore();
  const { currentFrame, isRecording, isPlaying, duration } = useTimelineStore();
  const { fps } = useKeyframeStore();

  const currentTime = (currentFrame / fps).toFixed(2);
  const totalTime = (duration / fps).toFixed(2);

  return (
    <div className="h-6 bg-secondary border-t border-border flex items-center px-4 text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-6">
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 font-medium">REC</span>
          </div>
        )}

        {/* Frame info */}
        <div className="flex items-center gap-2">
          <span>Frame:</span>
          <span className="font-mono">{Math.round(currentFrame)}</span>
          <span>/</span>
          <span className="font-mono">{duration}</span>
        </div>

        {/* Time info */}
        <div className="flex items-center gap-2">
          <span>Time:</span>
          <span className="font-mono">{currentTime}s</span>
          <span>/</span>
          <span className="font-mono">{totalTime}s</span>
        </div>

        {/* FPS indicator */}
        <div className="flex items-center gap-2">
          <span>FPS:</span>
          <span className="font-mono">{fps}</span>
          {isPlaying && <span className="text-green-500">●</span>}
        </div>

        {/* Canvas resolution */}
        <div className="flex items-center gap-2">
          <span>Resolution:</span>
          <span className="font-mono">{width}×{height}</span>
        </div>
      </div>
    </div>
  );
}
