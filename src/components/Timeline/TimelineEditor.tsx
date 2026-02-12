import { Play, Pause, Square, ChevronDown } from 'lucide-react';
import { SimpleTimeline } from './SimpleTimeline';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useKeyframeStore } from '@/stores/useKeyframeStore';
import { useLayoutStore } from '@/stores/useLayoutStore';

export function TimelineEditor() {
  const { isPlaying, togglePlayPause, stop, setCurrentFrame, currentFrame, duration, setDuration } = useTimelineStore();
  const {
    channels,
    fps,
    setFps,
    loop,
    setLoop,
    getAllKeyframeTimes,
  } = useKeyframeStore();
  const { toggleTimeline } = useLayoutStore();

  const allKeyframeTimes = getAllKeyframeTimes();

  // Count total keyframes across all channels
  const totalKeyframes = Object.values(channels).reduce(
    (sum, channel) => sum + channel.keyframes.length,
    0
  );

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Timeline controls */}
      <div className="h-12 border-b border-border flex items-center gap-4 px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={stop}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">FPS:</label>
          <input
            type="number"
            min="1"
            max="60"
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value) || 30)}
            className="w-16 px-2 py-1 text-sm bg-background border border-border rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
              className="w-4 h-4"
            />
            Loop
          </label>
        </div>

        <div className="text-sm text-muted-foreground ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">Frame:</label>
            <input
              type="number"
              min="0"
              max={duration}
              value={Math.round(currentFrame)}
              onChange={(e) => setCurrentFrame(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 text-sm bg-background border border-border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Duration:</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 300)}
              className="w-20 px-2 py-1 text-sm bg-background border border-border rounded"
            />
            <span className="text-xs">frames</span>
          </div>
          <span>Total keyframes: {totalKeyframes}</span>
        </div>

        <button
          onClick={toggleTimeline}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent transition-colors"
          title="Hide Timeline"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Debug display */}
      <div className="px-4 py-2 text-xs bg-muted border-b border-border">
        <div className="flex gap-4">
          <span>Current Frame: {currentFrame.toFixed(1)} / {duration}</span>
          <span>Total Keyframes: {totalKeyframes}</span>
          <span>Keyframe times: {allKeyframeTimes.join(', ')}</span>
          <span>Channels: {Object.entries(channels).map(([key, ch]) => `${key}(${ch.keyframes.length})`).join(', ')}</span>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="flex-1 overflow-hidden relative bg-[#1a1a1a]">
        <SimpleTimeline />
      </div>
    </div>
  );
}
