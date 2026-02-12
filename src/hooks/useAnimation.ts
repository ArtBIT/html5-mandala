import { useEffect, useRef } from 'react';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useKeyframeStore, type ParameterKey } from '@/stores/useKeyframeStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { setSkipHistory } from '@/stores/useHistoryStore';
import { getEasingFunction, interpolateAngle } from '@/core/easing';

export function useAnimation() {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const { isPlaying, currentFrame, setCurrentFrame, duration } = useTimelineStore();
  const { channels, fps, loop } = useKeyframeStore();
  const config = useConfigStore();

  // Interpolate value for a single parameter
  const interpolateParameter = (param: ParameterKey, time: number): number => {
    const channel = channels[param];
    const keyframes = channel.keyframes;

    // If no keyframes, return default value
    if (keyframes.length === 0) {
      return getDefaultValue(param);
    }

    // If only one keyframe, return its value
    if (keyframes.length === 1) {
      return keyframes[0].value;
    }

    // Find surrounding keyframes
    let prevKeyframe = keyframes[0];
    let nextKeyframe = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
        prevKeyframe = keyframes[i];
        nextKeyframe = keyframes[i + 1];
        break;
      }
    }

    // If before first keyframe, return first value
    if (time <= keyframes[0].time) {
      return keyframes[0].value;
    }

    // If after last keyframe, return last value
    if (time >= keyframes[keyframes.length - 1].time) {
      return keyframes[keyframes.length - 1].value;
    }

    // Calculate interpolation factor (0 to 1)
    const timeDelta = nextKeyframe.time - prevKeyframe.time;
    if (timeDelta === 0) return prevKeyframe.value;

    const t = (time - prevKeyframe.time) / timeDelta;

    // Apply easing function
    const easingFn = getEasingFunction(prevKeyframe.easing);
    const easedT = easingFn(t);

    // Use shortest path interpolation for angle parameters
    const isAngleParam = param === 'angle' || param === 'patternAngle';
    if (isAngleParam) {
      return interpolateAngle(prevKeyframe.value, nextKeyframe.value, easedT);
    }

    // Linear interpolation with easing
    return prevKeyframe.value + (nextKeyframe.value - prevKeyframe.value) * easedT;
  };

  // Get default value for a parameter
  const getDefaultValue = (param: ParameterKey): number => {
    switch (param) {
      case 'angle':
        return 0;
      case 'offset.x':
        return 0;
      case 'offset.y':
        return 0;
      case 'patternScale':
        return 1;
      case 'patternAngle':
        return 0;
      case 'symmetries':
        return 7;
    }
  };

  // Update config with interpolated values (animation-driven, no undo history)
  const updateConfig = (time: number) => {
    setSkipHistory(true);
    // Only interpolate enabled channels
    if (channels.angle.enabled) {
      const angle = interpolateParameter('angle', time);
      config.setAngle(angle);
    }

    if (channels['offset.x'].enabled || channels['offset.y'].enabled) {
      const offsetX = channels['offset.x'].enabled ? interpolateParameter('offset.x', time) : config.offset.x;
      const offsetY = channels['offset.y'].enabled ? interpolateParameter('offset.y', time) : config.offset.y;
      config.setOffset({ x: offsetX, y: offsetY });
    }

    if (channels.patternScale.enabled) {
      const patternScale = interpolateParameter('patternScale', time);
      config.setPatternScale(patternScale);
    }

    if (channels.patternAngle.enabled) {
      const patternAngle = interpolateParameter('patternAngle', time);
      config.setPatternAngle(patternAngle);
    }

    if (channels.symmetries.enabled) {
      const symmetries = interpolateParameter('symmetries', time);
      config.setSymmetries(symmetries);
    }
    setSkipHistory(false);
  };

  // Animation loop
  useEffect(() => {

    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let startTime = performance.now();
    lastTimeRef.current = startTime;

    const animate = (currentTime: number) => {
      // Check current playing state from the store (not closure)
      const currentlyPlaying = useTimelineStore.getState().isPlaying;
      if (!currentlyPlaying) {
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Get current frame from store
      const currentFrameValue = useTimelineStore.getState().currentFrame;

      // Calculate frame increment based on FPS
      const frameIncrement = (deltaTime / 1000) * fps;
      let newFrame = currentFrameValue + frameIncrement;

      // Handle looping
      const currentDuration = useTimelineStore.getState().duration;
      if (newFrame >= currentDuration) {
        if (loop) {
          newFrame = 0;
        } else {
          newFrame = currentDuration;
          // Stop playback at the end if not looping
          useTimelineStore.getState().togglePlayPause();
          return;
        }
      }

      // Update current frame
      setCurrentFrame(newFrame);

      // Interpolate and update config
      updateConfig(newFrame);

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, fps, loop, duration]);

  // Update config when manually scrubbing (not playing)
  useEffect(() => {
    if (!isPlaying) {
      updateConfig(currentFrame);
    }
  }, [currentFrame, isPlaying]);

  return null;
}
