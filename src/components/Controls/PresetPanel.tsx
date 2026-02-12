import { useState } from 'react';
import { usePresetStore } from '@/stores/usePresetStore';
import { Save, Trash2, Download, Upload, Edit2, AlertCircle } from 'lucide-react';

export function PresetPanel() {
  const {
    currentPresetName,
    hasUnsavedChanges,
    savePreset,
    loadPreset,
    deletePreset,
    renamePreset,
    getPresetNames,
    exportPreset,
    importPreset,
    exportAllPresets,
    isBuiltInPreset,
  } = usePresetStore();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const presetNames = getPresetNames();

  const handleSave = () => {
    if (!saveName.trim()) return;
    savePreset(saveName.trim());
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleLoad = (name: string) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Load preset anyway?')) {
        return;
      }
    }
    loadPreset(name);
  };

  const handleDelete = (name: string) => {
    if (confirm(`Delete preset "${name}"?`)) {
      deletePreset(name);
    }
  };

  const handleRename = () => {
    if (!currentPresetName || !newName.trim()) return;
    renamePreset(currentPresetName, newName.trim());
    setIsRenaming(false);
    setNewName('');
  };

  const handleExportPreset = (name: string) => {
    try {
      const json = exportPreset(name);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export preset');
      console.error(e);
    }
  };

  const handleExportAll = () => {
    try {
      const json = exportAllPresets();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mandala-presets.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export presets');
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Presets</h3>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-xs text-yellow-500">
            <AlertCircle className="w-3 h-3" />
            <span>Unsaved</span>
          </div>
        )}
      </div>

      {/* Current Preset Display */}
      {currentPresetName && !isRenaming && (
        <div className="flex items-center gap-2 p-2 bg-secondary rounded">
          <span className="text-sm flex-1 truncate">{currentPresetName}</span>
          <button
            onClick={() => {
              setIsRenaming(true);
              setNewName(currentPresetName);
            }}
            className="p-1 hover:bg-background rounded transition-colors"
            title="Rename preset"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rename Input */}
      {isRenaming && currentPresetName && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                setNewName('');
              }
            }}
            className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="New name"
            autoFocus
          />
          <button
            onClick={handleRename}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsRenaming(false);
              setNewName('');
            }}
            className="px-3 py-1 text-sm bg-secondary rounded hover:bg-secondary/80"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Save Dialog */}
      {saveDialogOpen ? (
        <div className="space-y-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setSaveDialogOpen(false);
                setSaveName('');
              }
            }}
            className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                setSaveDialogOpen(false);
                setSaveName('');
              }}
              className="flex-1 px-3 py-1 text-sm bg-secondary rounded hover:bg-secondary/80"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setSaveDialogOpen(true);
            setSaveName(currentPresetName || '');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          <Save className="w-4 h-4" />
          Save Preset
        </button>
      )}

      {/* Preset List */}
      {presetNames.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          <div className="text-xs text-muted-foreground mb-2">
            {presetNames.length} preset{presetNames.length !== 1 ? 's' : ''}
          </div>
          {presetNames.map((name) => (
            <div
              key={name}
              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                name === currentPresetName
                  ? 'bg-primary/20 border border-primary'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <button
                onClick={() => handleLoad(name)}
                className="flex-1 text-left text-sm truncate"
              >
                {name}
              </button>
              <button
                onClick={() => handleExportPreset(name)}
                className="p-1 hover:bg-background rounded transition-colors"
                title="Export preset"
              >
                <Download className="w-4 h-4" />
              </button>
              {!isBuiltInPreset(name) && (
                <button
                  onClick={() => handleDelete(name)}
                  className="p-1 hover:bg-destructive rounded transition-colors"
                  title="Delete preset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Import/Export All */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <button
          onClick={handleImport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-secondary rounded hover:bg-secondary/80"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button
          onClick={handleExportAll}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-secondary rounded hover:bg-secondary/80"
          disabled={presetNames.length === 0}
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>
    </div>
  );
}
