import { useKeyframeStore, type ParameterKey } from '@/stores/useKeyframeStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useHistoryStore, batch } from '@/stores/useHistoryStore';
import { Plus, Shuffle, Undo2, Redo2 } from 'lucide-react';

export function ToolsToolbar() {
  const { addKeyframe } = useKeyframeStore();
  const { currentFrame } = useTimelineStore();
  const config = useConfigStore();
  const { undo, redo, past, future } = useHistoryStore();

  const handleAddKeyframe = () => {
    // Add keyframes for ALL parameters at current playhead position
    const parameters: Array<{ key: ParameterKey; value: number }> = [
      { key: 'angle', value: config.angle },
      { key: 'offset.x', value: config.offset.x },
      { key: 'offset.y', value: config.offset.y },
      { key: 'patternScale', value: config.patternScale },
      { key: 'patternAngle', value: config.patternAngle },
      { key: 'symmetries', value: config.symmetries },
    ];

    batch(() => {
      parameters.forEach(({ key, value }) => {
        addKeyframe(key, currentFrame, value);
      });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={undo}
        disabled={past.length === 0}
        className="h-8 px-2 flex items-center gap-1 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={redo}
        disabled={future.length === 0}
        className="h-8 px-2 flex items-center gap-1 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      <button
        onClick={handleAddKeyframe}
        className="h-8 px-3 flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors"
        title="Add keyframe for all parameters at current time"
      >
        <Plus className="w-4 h-4" />
        <span>Keyframe All</span>
      </button>

      <button
        onClick={() => config.randomize()}
        className="h-8 px-3 flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors"
        title="Randomize all parameters"
      >
        <Shuffle className="w-4 h-4" />
        <span>Randomize</span>
      </button>
    </div>
  );
}
