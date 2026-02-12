import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import Mandala from '@/core/mandala';
import Stage from '@/core/stage';

export function MandalaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mandalaRef = useRef<Mandala | null>(null);
  const stageRef = useRef<Stage | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialValues, setInitialValues] = useState({
    angle: 0,
    patternAngle: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const config = useConfigStore();

  // Initialize canvas, stage, and mandala on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // @ts-ignore - JavaScript class without proper type definitions
    stageRef.current = new Stage(canvasRef.current);
    // @ts-ignore - JavaScript class without proper type definitions
    mandalaRef.current = new Mandala();

    // Add paste event listener
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            loadImageFromFile(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);

    // Add global mouse up handler for drag interactions
    const handleGlobalMouseUp = () => {
      setIsInteracting(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);

    // Initial render
    renderMandala();

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      stageRef.current = null;
      mandalaRef.current = null;
    };
  }, []);

  // Recreate pattern when makeTilable changes
  useEffect(() => {
    if (loadedImageRef.current) {
      createPattern(loadedImageRef.current);
    }
  }, [config.makeTilable]);

  // Re-render when config or current keyframe changes
  useEffect(() => {
    renderMandala();
  }, [
    config.width,
    config.height,
    config.scale,
    config.angle,
    config.backgroundColor,
    config.offset,
    config.patternScale,
    config.patternAngle,
    config.symmetries,
    config.file,
  ]);

  const loadImageFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImageRef.current = img;
        createPattern(img);
        config.setFile(file);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const createPattern = (img: HTMLImageElement) => {
    if (!stageRef.current || !mandalaRef.current) return;

    // @ts-ignore - JavaScript class without proper type definitions
    const ctx = stageRef.current.ctx;
    let patternImage = img;

    // Handle makeTilable - create 2x2 mirrored grid
    if (config.makeTilable) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width * 2;
      tempCanvas.height = img.height * 2;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        // Draw original image in top-left
        tempCtx.drawImage(img, 0, 0);

        // Mirror image horizontally to top-right
        tempCtx.save();
        tempCtx.translate(img.width, 0);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(img, -img.width, 0);
        tempCtx.restore();

        // Mirror the entire top half (both quadrants) vertically to bottom
        tempCtx.save();
        tempCtx.translate(0, img.height);
        tempCtx.scale(1, -1);
        tempCtx.drawImage(tempCanvas, 0, -img.height);
        tempCtx.restore();

        patternImage = tempCanvas as any;
      }
    }

    // @ts-ignore - JavaScript class without proper type definitions
    const pattern = ctx.createPattern(patternImage, 'repeat');
    if (pattern) {
      // @ts-ignore - JavaScript class without proper type definitions
      mandalaRef.current.setPattern(pattern);
      renderMandala();
    }
  };

  const renderMandala = () => {
    if (!stageRef.current || !mandalaRef.current) return;

    // Update stage dimensions
    stageRef.current.setWidth(config.width);
    stageRef.current.setHeight(config.height);
    stageRef.current.setScale(config.scale);

    // Update mandala scale and rotation
    mandalaRef.current.setScale(config.patternScale);
    mandalaRef.current.setRotation(config.patternAngle);

    // Clear and render
    // @ts-ignore - JavaScript class without proper type definitions
    stageRef.current.clear();

    const params = {
      angle: config.angle,
      offset: config.offset,
      patternScale: config.patternScale,
      patternAngle: config.patternAngle,
      symmetries: config.symmetries,
      backgroundColor: config.backgroundColor,
    };

    // @ts-ignore - JavaScript class without proper type definitions
    mandalaRef.current.render(stageRef.current.ctx, params);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        loadImageFromFile(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadImageFromFile(files[0]);
    }
  };

  // Canvas interaction handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't start interaction if we're uploading or dragging files
    if (isDragging) return;

    setIsInteracting(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialValues({
      angle: config.angle,
      patternAngle: config.patternAngle,
      offsetX: config.offset.x,
      offsetY: config.offset.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteracting) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Shift: Adjust angle
    if (e.shiftKey) {
      const angleDelta = deltaX * 0.5; // 0.5 degrees per pixel
      config.setAngle(initialValues.angle + angleDelta);
    }
    // Alt: Adjust pattern angle
    else if (e.altKey) {
      const angleDelta = deltaX * 0.5;
      config.setPatternAngle(initialValues.patternAngle + angleDelta);
    }
    // Default: Adjust offset
    else {
      const offsetDeltaX = deltaX * 0.002; // Normalized to -1...1 range
      const offsetDeltaY = -deltaY * 0.002; // Inverted Y
      config.setOffset({
        x: Math.max(-1, Math.min(1, initialValues.offsetX + offsetDeltaX)),
        y: Math.max(-1, Math.min(1, initialValues.offsetY + offsetDeltaY)),
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsInteracting(false);
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const delta = -e.deltaY * 0.001; // Scroll sensitivity
    const newScale = Math.max(0.05, Math.min(4, config.patternScale + delta));
    config.setPatternScale(newScale);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center p-4 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Upload button */}
      <div className="absolute top-4 right-4 z-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg"
          title="Upload pattern image"
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/20 border-4 border-dashed border-primary rounded-lg flex items-center justify-center z-20 pointer-events-none">
          <div className="text-2xl font-bold text-primary">
            Drop image here
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full shadow-2xl cursor-move"
        style={{
          imageRendering: 'pixelated',
          cursor: isInteracting
            ? 'grabbing'
            : 'grab',
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
      />

      {/* Instructions */}
      {!config.file && (
        <div className="absolute bottom-4 text-center text-sm text-muted-foreground bg-background/80 px-4 py-2 rounded-lg">
          <p className="font-medium mb-1">Drag & drop an image, paste (Ctrl+V), or click Upload Image</p>
        </div>
      )}

      {/* Interaction hints */}
      {config.file && (
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-3 py-2 rounded-lg space-y-1">
          <p><strong>Drag:</strong> Adjust offset</p>
          <p><strong>Shift+Drag:</strong> Adjust angle</p>
          <p><strong>Alt+Drag:</strong> Adjust pattern angle</p>
          <p><strong>Mouse Wheel:</strong> Adjust pattern scale</p>
        </div>
      )}
    </div>
  );
}
