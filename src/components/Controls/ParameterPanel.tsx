import { useConfigStore } from '@/stores/useConfigStore';
import { KeyframeButton } from './KeyframeButton';
import { type ParameterKey } from '@/stores/useKeyframeStore';

interface ParameterRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  decimals?: number;
  parameter?: ParameterKey;
}

function ParameterRow({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  decimals = 0,
  parameter,
}: ParameterRowProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-muted-foreground min-w-[60px]">{label}</label>
        <div className="flex items-center gap-2 flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={decimals === 0 ? Math.round(value) : value.toFixed(decimals)}
            onChange={handleInputChange}
            className="w-16 px-2 py-0.5 text-xs text-right bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {unit && <span className="text-xs text-muted-foreground w-4">{unit}</span>}
          {parameter && <KeyframeButton parameter={parameter} />}
        </div>
      </div>
    </div>
  );
}

export function ParameterPanel() {
  const config = useConfigStore();

  return (
    <div className="h-full flex flex-col">
      {/* Parameters */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Canvas Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Canvas
          </h3>

          <ParameterRow
            label="Angle"
            value={config.angle}
            onChange={config.setAngle}
            min={-360}
            max={360}
            step={1}
            decimals={0}
            parameter="angle"
          />

          <div className="space-y-1 pt-2">
            <label className="text-xs text-muted-foreground">Background</label>
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => config.setBackgroundColor(e.target.value)}
              className="w-full h-8 rounded border border-border"
            />
          </div>
        </div>

        {/* Pattern Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Pattern
          </h3>

          <ParameterRow
            label="Symmetries"
            value={config.symmetries}
            onChange={config.setSymmetries}
            min={0}
            max={32}
            step={1}
            decimals={0}
            parameter="symmetries"
          />

          <ParameterRow
            label="Scale"
            value={config.patternScale}
            onChange={config.setPatternScale}
            min={0.05}
            max={4}
            step={0.05}
            decimals={2}
            parameter="patternScale"
          />

          <ParameterRow
            label="Angle"
            value={config.patternAngle}
            onChange={config.setPatternAngle}
            min={-360}
            max={360}
            step={1}
            decimals={0}
            parameter="patternAngle"
          />

          <ParameterRow
            label="Offset X"
            value={config.offset.x}
            onChange={(val) => config.setOffset({ ...config.offset, x: val })}
            min={-1}
            max={1}
            step={0.01}
            decimals={2}
            parameter="offset.x"
          />

          <ParameterRow
            label="Offset Y"
            value={config.offset.y}
            onChange={(val) => config.setOffset({ ...config.offset, y: val })}
            min={-1}
            max={1}
            step={0.01}
            decimals={2}
            parameter="offset.y"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="makeTilable"
              checked={config.makeTilable}
              onChange={(e) => config.setMakeTilable(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="makeTilable" className="text-xs cursor-pointer">
              Make Pattern Tilable
            </label>
          </div>
        </div>

        {/* Randomize Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Randomize
          </h3>

          <ParameterRow
            label="Strength"
            value={config.randomizeStrength}
            onChange={config.setRandomizeStrength}
            min={0}
            max={1}
            step={0.1}
            decimals={1}
          />

          <button
            onClick={() => config.randomize()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Randomize Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
