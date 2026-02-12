import type { ReactNode } from 'react';
import { ChevronUp, Film } from 'lucide-react';
import { Statusbar } from './Statusbar';
import { ResizeHandle } from './ResizeHandle';
import { useLayoutStore } from '@/stores/useLayoutStore';

interface AppLayoutProps {
  toolbar?: ReactNode;
  canvas: ReactNode;
  controls: ReactNode;
  timeline: ReactNode;
}

export function AppLayout({ toolbar, canvas, controls, timeline }: AppLayoutProps) {
  const {
    controlsPanelWidth,
    timelineHeight,
    timelineCollapsed,
    setControlsPanelWidth,
    setTimelineHeight,
    toggleTimeline,
  } = useLayoutStore();

  const handleControlsResize = (delta: number) => {
    setControlsPanelWidth(controlsPanelWidth - delta); // Subtract because we're resizing from the left edge
  };

  const handleTimelineResize = (delta: number) => {
    setTimelineHeight(timelineHeight - delta); // Subtract because we're resizing from the top edge
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      {/* Toolbar */}
      {toolbar}

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Canvas and Controls Row */}
        <div className="flex-1 overflow-hidden flex relative" style={{
          minHeight: timelineCollapsed ? undefined : `calc(100% - ${timelineHeight}px)`
        }}>
          {/* Canvas area */}
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted relative">
            {canvas}

            {/* Show timeline toggle button when collapsed */}
            {timelineCollapsed && (
              <button
                onClick={toggleTimeline}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2 shadow-lg z-10"
                title="Show Timeline"
              >
                <Film className="w-4 h-4" />
                <span className="text-sm">Show Timeline</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls Panel */}
          <div
            className="overflow-auto bg-card border-l border-border relative flex"
            style={{ width: `${controlsPanelWidth}px` }}
          >
            {/* Resize handle on left edge */}
            <ResizeHandle
              direction="horizontal"
              onResize={handleControlsResize}
              className="absolute left-0 top-0 bottom-0 z-10"
            />
            <div className="flex-1">
              {controls}
            </div>
          </div>
        </div>

        {/* Timeline area - full width */}
        {!timelineCollapsed && (
          <div
            className="overflow-hidden bg-card border-t border-border relative"
            style={{ height: `${timelineHeight}px` }}
          >
            {/* Resize handle on top edge */}
            <ResizeHandle
              direction="vertical"
              onResize={handleTimelineResize}
              className="absolute top-0 left-0 right-0 z-10"
            />
            {timeline}
          </div>
        )}
      </div>

      {/* Statusbar */}
      <Statusbar />
    </div>
  );
}
