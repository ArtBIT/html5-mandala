import { useState, useRef } from 'react';
import { usePresetStore } from '@/stores/usePresetStore';
import { Save, Trash2, Download, Upload, ChevronDown } from 'lucide-react';

export function PresetToolbar() {
  const {
    currentPresetName,
    savePreset,
    loadPreset,
    deletePreset,
    getPresetNames,
    exportPreset,
    importPreset,
    isBuiltInPreset,
  } = usePresetStore();

  const [showPresetList, setShowPresetList] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presetNames = getPresetNames();

  const handleSave = () => {
    if (!saveName.trim()) return;

    const trimmedName = saveName.trim();

    // Check if preset with this name already exists
    if (presetNames.includes(trimmedName)) {
      const confirmed = confirm(
        `A preset named "${trimmedName}" already exists. Do you want to overwrite it?`
      );
      if (!confirmed) return;
    }

    savePreset(trimmedName);
    setShowSaveDialog(false);
    setSaveName('');
  };

  const handleLoad = (name: string) => {
    loadPreset(name);
    setShowPresetList(false);
  };

  const handleDelete = () => {
    if (!currentPresetName) return;
    if (confirm(`Delete preset "${currentPresetName}"?`)) {
      deletePreset(currentPresetName);
    }
  };

  const handleExport = () => {
    if (!currentPresetName) {
      alert('No preset selected');
      return;
    }

    try {
      const json = exportPreset(currentPresetName);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPresetName}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export preset');
      console.error(e);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          importPreset(json);
          alert('Preset imported successfully');
        } catch (err) {
          alert('Failed to import preset');
          console.error(err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* Preset Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowPresetList(!showPresetList)}
          className="h-8 px-3 flex items-center gap-2 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors min-w-[180px] justify-between"
        >
          <span className="truncate">{currentPresetName || 'No preset selected'}</span>
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </button>

        {showPresetList && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPresetList(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded shadow-lg z-20 max-h-80 overflow-y-auto">
              {presetNames.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No presets saved
                </div>
              ) : (
                presetNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleLoad(name)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors ${
                      name === currentPresetName ? 'bg-primary/20 text-primary' : ''
                    } ${isBuiltInPreset(name) ? 'italic text-muted-foreground' : ''}`}
                  >
                    {name}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={!currentPresetName || isBuiltInPreset(currentPresetName)}
        className="h-8 w-8 flex items-center justify-center rounded hover:bg-destructive/20 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title={currentPresetName && isBuiltInPreset(currentPresetName) ? "Built-in presets can't be deleted" : "Delete current preset"}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Save Button */}
      <div className="relative">
        {showSaveDialog && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveName('');
              }}
            />
            <div className="absolute top-full right-0 mt-1 bg-background border border-border rounded shadow-lg z-20 p-3 w-64">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setShowSaveDialog(false);
                  setSaveName('');
                }
              }}
              className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary mb-2"
              placeholder="Preset name"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="flex-1 px-3 py-1 text-sm bg-secondary rounded hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
        )}
        <button
          onClick={() => {
            setShowSaveDialog(true);
            setSaveName(currentPresetName || '');
          }}
          className="h-8 px-3 flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-sm transition-colors"
          title="Save preset"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={!currentPresetName}
        className="h-8 px-3 flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Export current preset"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>

      {/* Import Button */}
      <button
        onClick={handleImport}
        className="h-8 px-3 flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors"
        title="Import preset"
      >
        <Upload className="w-4 h-4" />
        <span>Import</span>
      </button>
    </div>
  );
}
