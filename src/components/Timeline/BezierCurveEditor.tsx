import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface BezierCurveEditorProps {
  initialP1?: { x: number; y: number };
  initialP2?: { x: number; y: number };
  onSave: (p1: { x: number; y: number }, p2: { x: number; y: number }) => void;
  onClose: () => void;
}

export function BezierCurveEditor({ initialP1, initialP2, onSave, onClose }: BezierCurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [p1, setP1] = useState(initialP1 || { x: 0.25, y: 0.1 });
  const [p2, setP2] = useState(initialP2 || { x: 0.25, y: 1.0 });
  const [dragging, setDragging] = useState<'p1' | 'p2' | null>(null);

  const CANVAS_SIZE = 300;
  const PADDING = 40;
  const GRID_SIZE = CANVAS_SIZE - 2 * PADDING;

  // Convert normalized coordinates (0-1) to canvas coordinates
  const toCanvasX = (x: number) => PADDING + x * GRID_SIZE;
  const toCanvasY = (y: number) => PADDING + (1 - y) * GRID_SIZE; // Invert Y

  // Convert canvas coordinates to normalized (0-1)
  const fromCanvasX = (x: number) => Math.max(0, Math.min(1, (x - PADDING) / GRID_SIZE));
  const fromCanvasY = (y: number) => Math.max(0, Math.min(1, 1 - (y - PADDING) / GRID_SIZE)); // Invert Y

  // Draw the curve editor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    // Vertical and horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const pos = PADDING + (i / 4) * GRID_SIZE;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(pos, PADDING);
      ctx.lineTo(pos, PADDING + GRID_SIZE);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(PADDING, pos);
      ctx.lineTo(PADDING + GRID_SIZE, pos);
      ctx.stroke();
    }

    // Draw border
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(PADDING, PADDING, GRID_SIZE, GRID_SIZE);

    // Draw diagonal reference line (linear)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + GRID_SIZE);
    ctx.lineTo(PADDING + GRID_SIZE, PADDING);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bezier curve
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + GRID_SIZE); // Start point (0, 0)

    // Draw cubic bezier curve
    const cp1x = toCanvasX(p1.x);
    const cp1y = toCanvasY(p1.y);
    const cp2x = toCanvasX(p2.x);
    const cp2y = toCanvasY(p2.y);
    const endX = PADDING + GRID_SIZE;
    const endY = PADDING;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();

    // Draw control point lines
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Line from start to P1
    ctx.beginPath();
    ctx.moveTo(PADDING, PADDING + GRID_SIZE);
    ctx.lineTo(cp1x, cp1y);
    ctx.stroke();

    // Line from P2 to end
    ctx.beginPath();
    ctx.moveTo(cp2x, cp2y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw control points
    const drawControlPoint = (x: number, y: number, label: string, isDragging: boolean) => {
      ctx.fillStyle = isDragging ? '#ffffff' : '#3b82f6';
      ctx.strokeStyle = isDragging ? '#3b82f6' : '#ffffff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText(label, x + 12, y + 4);
    };

    drawControlPoint(cp1x, cp1y, 'P1', dragging === 'p1');
    drawControlPoint(cp2x, cp2y, 'P2', dragging === 'p2');

    // Draw start and end points
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(PADDING, PADDING + GRID_SIZE, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fill();

  }, [p1, p2, dragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on P1
    const p1x = toCanvasX(p1.x);
    const p1y = toCanvasY(p1.y);
    if (Math.hypot(x - p1x, y - p1y) < 12) {
      setDragging('p1');
      return;
    }

    // Check if clicking on P2
    const p2x = toCanvasX(p2.x);
    const p2y = toCanvasY(p2.y);
    if (Math.hypot(x - p2x, y - p2y) < 12) {
      setDragging('p2');
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = fromCanvasX(x);
    const newY = fromCanvasY(y);

    if (dragging === 'p1') {
      setP1({ x: newX, y: newY });
    } else if (dragging === 'p2') {
      setP2({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleSave = () => {
    onSave(p1, p2);
    onClose();
  };

  const presets = [
    { name: 'Linear', p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } },
    { name: 'Ease', p1: { x: 0.25, y: 0.1 }, p2: { x: 0.25, y: 1.0 } },
    { name: 'Ease In', p1: { x: 0.42, y: 0 }, p2: { x: 1.0, y: 1.0 } },
    { name: 'Ease Out', p1: { x: 0, y: 0 }, p2: { x: 0.58, y: 1.0 } },
    { name: 'Ease In-Out', p1: { x: 0.42, y: 0 }, p2: { x: 0.58, y: 1.0 } },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg border border-border p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Bezier Curve Editor</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border border-border rounded cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <div className="mt-4 space-y-2">
          <div className="text-sm text-muted-foreground">
            <p>P1: ({p1.x.toFixed(2)}, {p1.y.toFixed(2)})</p>
            <p>P2: ({p2.x.toFixed(2)}, {p2.y.toFixed(2)})</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setP1(preset.p1);
                  setP2(preset.p2);
                }}
                className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
