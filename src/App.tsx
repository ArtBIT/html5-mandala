import { AppLayout } from './components/Layout/AppLayout';
import { MandalaCanvas } from './components/Canvas/MandalaCanvas';
import { TimelineEditor } from './components/Timeline/TimelineEditor';
import { ParameterPanel } from './components/Controls/ParameterPanel';
import { Toolbar, ToolbarSection, ToolbarSeparator } from './components/Toolbar/Toolbar';
import { PresetToolbar } from './components/Toolbar/PresetToolbar';
import { ToolsToolbar } from './components/Toolbar/ToolsToolbar';
import { ExportToolbar } from './components/Toolbar/ExportToolbar';
import { useAnimation } from './hooks/useAnimation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoSave } from './hooks/useAutoSave';

function App() {
  // Initialize animation system (handles playback and interpolation)
  useAnimation();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize auto-save and auto-load
  useAutoSave();

  return (
    <AppLayout
      toolbar={
        <Toolbar>
          <ToolbarSection title="Presets">
            <PresetToolbar />
          </ToolbarSection>
          <ToolbarSeparator />
          <ToolbarSection title="Tools">
            <ToolsToolbar />
          </ToolbarSection>
          <ToolbarSeparator />
          <ToolbarSection title="Export">
            <ExportToolbar />
          </ToolbarSection>
          {/* Buy Me A Coffee button - right aligned */}
          <div className="ml-auto">
            <a
              href="https://www.buymeacoffee.com/artbit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/default-green.png"
                height="30"
                alt="Buy Me A Coffee"
                className="h-8"
              />
            </a>
          </div>
        </Toolbar>
      }
      canvas={<MandalaCanvas />}
      timeline={<TimelineEditor />}
      controls={<ParameterPanel />}
    />
  );
}

export default App;
