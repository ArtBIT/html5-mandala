import { useKeyframeStore, type ParameterKey } from '@/stores/useKeyframeStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useConfigStore } from '@/stores/useConfigStore';

interface KeyframeButtonProps {
  parameter: ParameterKey;
}

export function KeyframeButton({ parameter }: KeyframeButtonProps) {
  const { currentFrame } = useTimelineStore();
  const { hasKeyframeAt, addKeyframe, removeKeyframe, updateKeyframe, getKeyframeAtTime } = useKeyframeStore();
  const config = useConfigStore();

  // Check if there's a keyframe for this parameter at current time
  const hasKeyframe = hasKeyframeAt(parameter, currentFrame);

  // Get the current value for this parameter
  const getCurrentValue = (): number => {
    switch (parameter) {
      case 'angle':
        return config.angle;
      case 'offset.x':
        return config.offset.x;
      case 'offset.y':
        return config.offset.y;
      case 'patternScale':
        return config.patternScale;
      case 'patternAngle':
        return config.patternAngle;
      case 'symmetries':
        return config.symmetries;
    }
  };

  // Check if the current value differs from the saved keyframe value (dirty state)
  const isDirty = (): boolean => {
    if (!hasKeyframe) return false;

    const keyframe = getKeyframeAtTime(parameter, currentFrame);
    if (!keyframe) return false;

    const currentValue = getCurrentValue();
    const tolerance = parameter === 'symmetries' ? 0.1 : 0.001;

    return Math.abs(currentValue - keyframe.value) > tolerance;
  };

  const dirty = isDirty();

  const handleClick = (e: React.MouseEvent) => {
    const value = getCurrentValue();

    // Shift+click always removes the keyframe
    if (e.shiftKey && hasKeyframe) {
      removeKeyframe(parameter, currentFrame);
      return;
    }

    if (hasKeyframe) {
      // Update existing keyframe with current value
      updateKeyframe(parameter, currentFrame, value);
    } else {
      // Add new keyframe
      addKeyframe(parameter, currentFrame, value);
    }
  };

  // Determine visual state
  const getColor = () => {
    if (!hasKeyframe) return 'text-muted-foreground';
    if (dirty) return 'text-orange-500';
    return 'text-primary';
  };

  const getTitle = () => {
    if (!hasKeyframe) return 'Add keyframe';
    if (dirty) return 'Update keyframe (value changed) • Shift+click to remove';
    return 'Keyframe set • Shift+click to remove';
  };

  return (
    <button
      onClick={handleClick}
      className={`w-5 h-5 flex items-center justify-center rounded hover:bg-accent transition-colors ${getColor()}`}
      title={getTitle()}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill={hasKeyframe ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M8 2 L14 8 L8 14 L2 8 Z" />
      </svg>
    </button>
  );
}
