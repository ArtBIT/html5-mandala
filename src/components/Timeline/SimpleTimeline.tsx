import { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useKeyframeStore, type ParameterKey } from '@/stores/useKeyframeStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { batch } from '@/stores/useHistoryStore';
import { BezierCurveEditor } from './BezierCurveEditor';

const RULER_HEIGHT = 30;
const CHANNEL_HEIGHT = 40;
const LABEL_WIDTH = 120;
const RIGHT_PADDING = 25; // Padding on right side to make dragging to end easier

const CHANNELS: Array<{ key: ParameterKey; label: string; color: string }> = [
  { key: 'angle', label: 'Angle', color: '#3b82f6' },
  { key: 'offset.x', label: 'Offset X', color: '#10b981' },
  { key: 'offset.y', label: 'Offset Y', color: '#8b5cf6' },
  { key: 'patternScale', label: 'Pattern Scale', color: '#f59e0b' },
  { key: 'patternAngle', label: 'Pattern Angle', color: '#ef4444' },
  { key: 'symmetries', label: 'Symmetries', color: '#ec4899' },
];

export function SimpleTimeline() {
  const rulerCanvasRef = useRef<HTMLCanvasElement>(null);
  const channelsCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const channelsContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelectDragging, setIsSelectDragging] = useState(false);
  const [selectStart, setSelectStart] = useState({ x: 0, y: 0 });
  const [selectEnd, setSelectEnd] = useState({ x: 0, y: 0 });
  const [draggedKeyframe, setDraggedKeyframe] = useState<{ param: ParameterKey; time: number; initialTime: number } | null>(null);
  const [draggedKeyframes, setDraggedKeyframes] = useState<Array<{ param: ParameterKey; time: number; initialTime: number }>>([]);
  const [curveEditorOpen, setCurveEditorOpen] = useState(false);
  const [editingKeyframe, setEditingKeyframe] = useState<{ param: ParameterKey; time: number } | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedKeyframe, setLastClickedKeyframe] = useState<{ param: ParameterKey; time: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; keyframe: { param: ParameterKey; time: number } } | null>(null);
  const [rulerContextMenu, setRulerContextMenu] = useState<{ x: number; y: number; frame: number } | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  const { currentFrame, setCurrentFrame, duration } = useTimelineStore();
  const { channels, selectKeyframe, isKeyframeSelected, clearSelection, selectedKeyframes, moveKeyframe, updateKeyframeEasing, toggleChannelVisibility } = useKeyframeStore();
  const config = useConfigStore();

  // Check if a keyframe value differs from current config value (dirty state)
  const isKeyframeDirty = (param: ParameterKey, keyframeValue: number): boolean => {
    let currentValue: number;
    switch (param) {
      case 'angle':
        currentValue = config.angle;
        break;
      case 'offset.x':
        currentValue = config.offset.x;
        break;
      case 'offset.y':
        currentValue = config.offset.y;
        break;
      case 'patternScale':
        currentValue = config.patternScale;
        break;
      case 'patternAngle':
        currentValue = config.patternAngle;
        break;
      case 'symmetries':
        currentValue = config.symmetries;
        break;
    }

    const tolerance = param === 'symmetries' ? 0.1 : 0.001;
    return Math.abs(currentValue - keyframeValue) > tolerance;
  };

  // Find keyframe at mouse position
  const getKeyframeAtPosition = (e: React.MouseEvent): { param: ParameterKey; time: number } | null => {
    if (!containerRef.current || !channelsContainerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = channelsContainerRef.current.scrollTop;
    const x = e.clientX - rect.left - LABEL_WIDTH;
    const y = e.clientY - rect.top - RULER_HEIGHT + scrollTop;
    const timelineWidth = rect.width - LABEL_WIDTH - RIGHT_PADDING;

    // Determine which channel was clicked
    const channelIndex = Math.floor(y / CHANNEL_HEIGHT);
    if (channelIndex < 0 || channelIndex >= CHANNELS.length) return null;

    const channel = CHANNELS[channelIndex];
    const channelKeyframes = channels[channel.key].keyframes;

    // Check if clicked near any keyframe (within 8px)
    for (const kf of channelKeyframes) {
      const kfX = (kf.time / duration) * timelineWidth;
      if (Math.abs(x - kfX) <= 8) {
        return { param: channel.key, time: kf.time };
      }
    }

    return null;
  };

  // Select all keyframes within the selection box
  const selectKeyframesInBox = (multiSelect: boolean) => {
    if (!containerRef.current || !channelsContainerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = channelsContainerRef.current.scrollTop;
    const timelineWidth = rect.width - LABEL_WIDTH - RIGHT_PADDING;

    const boxLeft = Math.min(selectStart.x, selectEnd.x) - LABEL_WIDTH;
    const boxRight = Math.max(selectStart.x, selectEnd.x) - LABEL_WIDTH;
    const boxTop = Math.min(selectStart.y, selectEnd.y) - RULER_HEIGHT + scrollTop;
    const boxBottom = Math.max(selectStart.y, selectEnd.y) - RULER_HEIGHT + scrollTop;

    CHANNELS.forEach((channel, channelIndex) => {
      const channelY = channelIndex * CHANNEL_HEIGHT;
      const channelKeyframes = channels[channel.key].keyframes;

      // Check if channel intersects with box
      if (channelY + CHANNEL_HEIGHT >= boxTop && channelY <= boxBottom) {
        channelKeyframes.forEach((kf) => {
          const kfX = (kf.time / duration) * timelineWidth;

          // Check if keyframe is within box
          if (kfX >= boxLeft && kfX <= boxRight) {
            selectKeyframe(channel.key, kf.time, multiSelect || true);
          }
        });
      }
    });
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y < RULER_HEIGHT) {
      // Right-click on ruler
      const x = e.clientX - rect.left - LABEL_WIDTH;
      const timelineWidth = rect.width - LABEL_WIDTH - RIGHT_PADDING;
      const frame = Math.round((x / timelineWidth) * duration);
      const clampedFrame = Math.max(0, Math.min(duration, frame));

      setContextMenu(null);
      setRulerContextMenu({ x: e.clientX, y: e.clientY, frame: clampedFrame });
      return;
    }

    setRulerContextMenu(null);
    const keyframe = getKeyframeAtPosition(e);
    if (keyframe) {
      setContextMenu({ x: e.clientX, y: e.clientY, keyframe });
    } else {
      setContextMenu(null);
    }
  };

  // Handle timeline click/drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // Close context menus on any click
    setContextMenu(null);
    setRulerContextMenu(null);
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Determine if clicking in ruler area or channel area
    const inRulerArea = y < RULER_HEIGHT;

    if (inRulerArea) {
      // Clicking in ruler area - always scrub playhead
      setIsDragging(true);
      updateFrameFromMouse(e);
    } else {
      // Clicking in channel area
      const keyframe = getKeyframeAtPosition(e);

      if (keyframe) {
        // Check for double-click
        const now = Date.now();
        const isDoubleClick =
          lastClickedKeyframe &&
          lastClickedKeyframe.param === keyframe.param &&
          lastClickedKeyframe.time === keyframe.time &&
          now - lastClickTime < 300;

        if (isDoubleClick) {
          // Double-click: Open curve editor
          setEditingKeyframe(keyframe);
          setCurveEditorOpen(true);
          setLastClickTime(0);
          setLastClickedKeyframe(null);
        } else {
          // Single click
          setLastClickTime(now);
          setLastClickedKeyframe(keyframe);

          // Check if this keyframe is already selected
          const alreadySelected = isKeyframeSelected(keyframe.param, keyframe.time);

          if (alreadySelected) {
            // Keyframe is selected - start dragging it and all other selected keyframes
            setDraggedKeyframe({ ...keyframe, initialTime: keyframe.time });

            // Collect all selected keyframes for group dragging
            const allDraggedKeyframes: Array<{ param: ParameterKey; time: number; initialTime: number }> = [];
            selectedKeyframes.forEach(key => {
              const [param, timeStr] = key.split(':');
              const time = parseFloat(timeStr);
              allDraggedKeyframes.push({ param: param as ParameterKey, time, initialTime: time });
            });
            setDraggedKeyframes(allDraggedKeyframes);
          } else {
            // Keyframe not selected - select it
            selectKeyframe(keyframe.param, keyframe.time, e.shiftKey);
          }
        }
      } else {
        // Clicked on empty space in channel area - start box selection
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSelectStart({ x, y });
        setSelectEnd({ x, y });
        setIsSelectDragging(true);

        if (!e.shiftKey) {
          clearSelection();
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    if (draggedKeyframe) {
      // Dragging keyframe(s)
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - LABEL_WIDTH;
      const timelineWidth = rect.width - LABEL_WIDTH - RIGHT_PADDING;
      const newTime = Math.round((x / timelineWidth) * duration);
      const clampedTime = Math.max(0, Math.min(duration, newTime));

      // Calculate delta from initial position
      const delta = clampedTime - draggedKeyframe.initialTime;

      // Move all selected keyframes by the same delta
      draggedKeyframes.forEach(kf => {
        const targetTime = kf.initialTime + delta;
        const clampedTarget = Math.max(0, Math.min(duration, targetTime));
        moveKeyframe(kf.param, kf.time, clampedTarget);
        // Update the time in our tracking array
        kf.time = clampedTarget;
      });

      // Update the main dragged keyframe
      setDraggedKeyframe({ ...draggedKeyframe, time: clampedTime });
    } else if (isSelectDragging) {
      // Update selection box
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setSelectEnd({ x, y });
    } else if (isDragging) {
      updateFrameFromMouse(e);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedKeyframe) {
      // Finished dragging keyframe(s)
      setDraggedKeyframe(null);
      setDraggedKeyframes([]);
    } else if (isSelectDragging) {
      // Finalize box selection
      selectKeyframesInBox(e.shiftKey);
      setIsSelectDragging(false);
    }
    setIsDragging(false);
  };

  const updateFrameFromMouse = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - LABEL_WIDTH;
    const timelineWidth = rect.width - LABEL_WIDTH - RIGHT_PADDING;
    const frame = Math.round((x / timelineWidth) * duration);
    setCurrentFrame(Math.max(0, Math.min(duration, frame)));
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Only handle double-clicks in the ruler area
    if (y >= RULER_HEIGHT) return;

    const x = e.clientX - rect.left - LABEL_WIDTH;
    const timelineWidth = rect.width - LABEL_WIDTH - RIGHT_PADDING;
    const frame = Math.round((x / timelineWidth) * duration);
    const clampedFrame = Math.max(0, Math.min(duration, frame));

    // Add keyframes for all parameters at this frame
    const { addKeyframe } = useKeyframeStore.getState();
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
        addKeyframe(key, clampedFrame, value);
      });
    });
  };

  // Draw ruler (fixed at top)
  useEffect(() => {
    const canvas = rulerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const timelineWidth = width - LABEL_WIDTH - RIGHT_PADDING;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, RULER_HEIGHT);

    // Draw label background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, LABEL_WIDTH, RULER_HEIGHT);

    // Draw separator line between labels and timeline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LABEL_WIDTH, 0);
    ctx.lineTo(LABEL_WIDTH, RULER_HEIGHT);
    ctx.stroke();

    // Draw ruler
    ctx.strokeStyle = '#444';
    ctx.fillStyle = '#888';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i <= duration; i += 10) {
      const x = LABEL_WIDTH + (i / duration) * timelineWidth;

      if (i % 30 === 0) {
        ctx.strokeStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, RULER_HEIGHT);
        ctx.stroke();
        ctx.fillStyle = '#aaa';
        ctx.fillText(i.toString(), x, 20);
      } else {
        ctx.strokeStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 15);
        ctx.stroke();
      }
    }

    // Draw playhead handle in ruler
    const playheadX = LABEL_WIDTH + (currentFrame / duration) * timelineWidth;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(playheadX - 6, 0, 12, RULER_HEIGHT - 2);

  }, [currentFrame, duration, canvasDimensions]);

  // Draw channels (scrollable)
  useEffect(() => {
    const canvas = channelsCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const timelineWidth = width - LABEL_WIDTH - RIGHT_PADDING;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw label background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, LABEL_WIDTH, height);

    // Draw separator line between labels and timeline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LABEL_WIDTH, 0);
    ctx.lineTo(LABEL_WIDTH, height);
    ctx.stroke();

    // Draw channel rows
    CHANNELS.forEach((channel, index) => {
      const y = index * CHANNEL_HEIGHT;
      const enabled = channels[channel.key].enabled;

      // Alternating background
      if (index % 2 === 0) {
        ctx.fillStyle = '#111';
        ctx.fillRect(LABEL_WIDTH, y, timelineWidth, CHANNEL_HEIGHT);
      }

      // Disabled channel overlay
      if (!enabled) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, y, width, CHANNEL_HEIGHT);
      }

      // Channel separator line
      ctx.strokeStyle = '#222';
      ctx.beginPath();
      ctx.moveTo(LABEL_WIDTH, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Channel label
      ctx.fillStyle = enabled ? '#666' : '#444';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(channel.label, 24, y + CHANNEL_HEIGHT / 2 + 4);

      // Draw keyframes for this channel
      const channelKeyframes = channels[channel.key].keyframes;
      channelKeyframes.forEach((kf) => {
        const x = LABEL_WIDTH + (kf.time / duration) * timelineWidth;
        const centerY = y + CHANNEL_HEIGHT / 2;
        const selected = isKeyframeSelected(channel.key, kf.time);

        // Check if keyframe is dirty (value changed at current frame)
        const isDirty = Math.abs(kf.time - currentFrame) <= 0.5 && isKeyframeDirty(channel.key, kf.value);

        // Keyframe diamond
        let baseColor = enabled ? channel.color : '#555';
        if (isDirty) {
          baseColor = '#f97316'; // Orange color for dirty keyframes
        }

        ctx.fillStyle = selected ? '#ffffff' : baseColor;
        ctx.strokeStyle = selected ? baseColor : '#000';
        ctx.lineWidth = selected ? 2 : 1;
        ctx.globalAlpha = enabled ? 1.0 : 0.4;
        ctx.beginPath();
        ctx.moveTo(x, centerY - 6);
        ctx.lineTo(x + 6, centerY);
        ctx.lineTo(x, centerY + 6);
        ctx.lineTo(x - 6, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Reset alpha
        ctx.globalAlpha = 1.0;

        // Show easing indicator for selected keyframes
        if (selected) {
          const easingLabel = typeof kf.easing === 'string'
            ? kf.easing.substring(0, 4)
            : 'bezr';

          ctx.fillStyle = enabled ? '#888' : '#555';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(easingLabel, x, centerY + 18);
        }
      });
    });

    // Draw playhead line through channels
    const playheadX = LABEL_WIDTH + (currentFrame / duration) * timelineWidth;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

  }, [currentFrame, channels, duration, selectedKeyframes, isKeyframeSelected, config.angle, config.offset.x, config.offset.y, config.patternScale, config.patternAngle, config.symmetries, canvasDimensions]);

  // Handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const rulerCanvas = rulerCanvasRef.current;
      const channelsCanvas = channelsCanvasRef.current;
      const container = containerRef.current;
      if (!rulerCanvas || !channelsCanvas || !container) return;

      const rect = container.getBoundingClientRect();
      const channelsHeight = CHANNELS.length * CHANNEL_HEIGHT;

      rulerCanvas.width = rect.width;
      rulerCanvas.height = RULER_HEIGHT;

      channelsCanvas.width = rect.width;
      channelsCanvas.height = channelsHeight;

      // Trigger re-render of draw effects
      setCanvasDimensions({ width: rect.width, height: channelsHeight });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Global mouse up handler (catches mouseup outside the timeline)
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Handle playhead dragging
      setIsDragging(false);

      // Handle keyframe dragging
      if (draggedKeyframe) {
        setDraggedKeyframe(null);
        setDraggedKeyframes([]);
      }

      // Handle box selection - finalize selection if dragging outside
      if (isSelectDragging) {
        // Determine if shift key was held during mouseup
        const shiftKey = e.shiftKey;
        selectKeyframesInBox(shiftKey);
        setIsSelectDragging(false);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelectDragging, draggedKeyframe, selectKeyframesInBox]);

  // Curve editor handlers
  const handleCurveEditorSave = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    if (!editingKeyframe) return;

    const bezierEasing = {
      type: 'bezier' as const,
      p1,
      p2,
    };

    // Apply to all selected keyframes if any are selected
    if (selectedKeyframes.size > 0) {
      batch(() => {
        selectedKeyframes.forEach(key => {
          const [param, timeStr] = key.split(':');
          const time = parseFloat(timeStr);
          updateKeyframeEasing(param as ParameterKey, time, bezierEasing);
        });
      });
    } else {
      // Apply to just the edited keyframe
      updateKeyframeEasing(editingKeyframe.param, editingKeyframe.time, bezierEasing);
    }
  };

  const handleCurveEditorClose = () => {
    setCurveEditorOpen(false);
    setEditingKeyframe(null);
  };

  const channelsHeight = CHANNELS.length * CHANNEL_HEIGHT;

  return (
    <>
      <div
        ref={containerRef}
        className="w-full h-full bg-[#1a1a1a] cursor-pointer relative flex flex-col"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Fixed ruler at top */}
        <div className="w-full sticky top-0 z-10" style={{ height: `${RULER_HEIGHT}px` }}>
          <canvas ref={rulerCanvasRef} className="w-full" style={{ height: `${RULER_HEIGHT}px` }} />
        </div>

        {/* Scrollable channels container */}
        <div ref={channelsContainerRef} className="w-full flex-1 overflow-y-auto relative">
          <canvas ref={channelsCanvasRef} className="w-full" style={{ height: `${channelsHeight}px` }} />

          {/* Channel visibility toggles */}
          <div className="absolute left-0 top-0 pointer-events-none">
            {CHANNELS.map((channel) => {
              const enabled = channels[channel.key].enabled;
              return (
                <div
                  key={channel.key}
                  className="flex items-center pointer-events-auto"
                  style={{ height: `${CHANNEL_HEIGHT}px` }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChannelVisibility(channel.key);
                    }}
                    className="ml-1 p-1 hover:bg-secondary/50 rounded transition-colors"
                    title={enabled ? 'Hide channel' : 'Show channel'}
                  >
                    {enabled ? (
                      <Eye className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-muted-foreground/40" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selection box overlay */}
        {isSelectDragging && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
            style={{
              left: `${Math.min(selectStart.x, selectEnd.x)}px`,
              top: `${Math.min(selectStart.y, selectEnd.y)}px`,
              width: `${Math.abs(selectEnd.x - selectStart.x)}px`,
              height: `${Math.abs(selectEnd.y - selectStart.y)}px`,
            }}
          />
        )}
      </div>

      {/* Curve editor modal */}
      {curveEditorOpen && editingKeyframe && (
        <BezierCurveEditor
          initialP1={
            typeof channels[editingKeyframe.param].keyframes.find(
              kf => Math.abs(kf.time - editingKeyframe.time) <= 0.5
            )?.easing === 'object' &&
            (channels[editingKeyframe.param].keyframes.find(
              kf => Math.abs(kf.time - editingKeyframe.time) <= 0.5
            )?.easing as { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } }).type === 'bezier'
              ? (channels[editingKeyframe.param].keyframes.find(
                  kf => Math.abs(kf.time - editingKeyframe.time) <= 0.5
                )?.easing as { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } }).p1
              : undefined
          }
          initialP2={
            typeof channels[editingKeyframe.param].keyframes.find(
              kf => Math.abs(kf.time - editingKeyframe.time) <= 0.5
            )?.easing === 'object' &&
            (channels[editingKeyframe.param].keyframes.find(
              kf => Math.abs(kf.time - editingKeyframe.time) <= 0.5
            )?.easing as { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } }).type === 'bezier'
              ? (channels[editingKeyframe.param].keyframes.find(
                  kf => Math.abs(kf.time - editingKeyframe.time) <= 0.5
                )?.easing as { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } }).p2
              : undefined
          }
          onSave={handleCurveEditorSave}
          onClose={handleCurveEditorClose}
        />
      )}

      {/* Context menu for easing presets */}
      {contextMenu && (
        <div
          className="fixed bg-background border border-border rounded shadow-lg z-50 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
            Easing {selectedKeyframes.size > 0 && `(${selectedKeyframes.size} keyframes)`}
          </div>
          <div className="border-t border-border my-1" />
          {['linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic'].map(
            (easingName) => (
              <button
                key={easingName}
                onClick={() => {
                  // Apply to all selected keyframes if any are selected
                  if (selectedKeyframes.size > 0) {
                    batch(() => {
                      selectedKeyframes.forEach(key => {
                        const [param, timeStr] = key.split(':');
                        const time = parseFloat(timeStr);
                        updateKeyframeEasing(param as ParameterKey, time, easingName);
                      });
                    });
                  } else {
                    // Apply to just the context menu keyframe
                    updateKeyframeEasing(contextMenu.keyframe.param, contextMenu.keyframe.time, easingName);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1 text-xs text-left hover:bg-secondary transition-colors"
              >
                {easingName}
              </button>
            )
          )}
          <div className="border-t border-border my-1" />
          <button
            onClick={() => {
              setEditingKeyframe(contextMenu.keyframe);
              setCurveEditorOpen(true);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-xs text-left hover:bg-secondary transition-colors font-medium"
          >
            Custom Bezier...
          </button>
        </div>
      )}

      {/* Context menu for ruler */}
      {rulerContextMenu && (
        <div
          className="fixed bg-background border border-border rounded shadow-lg z-50 py-1"
          style={{ left: rulerContextMenu.x, top: rulerContextMenu.y }}
          onMouseLeave={() => setRulerContextMenu(null)}
        >
          <button
            onClick={() => {
              const frame = rulerContextMenu.frame;
              const { addKeyframe } = useKeyframeStore.getState();
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
                  addKeyframe(key, frame, value);
                });
              });
              setRulerContextMenu(null);
            }}
            className="w-full px-3 py-1 text-xs text-left hover:bg-secondary transition-colors"
          >
            Add keyframes at frame {rulerContextMenu.frame}
          </button>
        </div>
      )}
    </>
  );
}
