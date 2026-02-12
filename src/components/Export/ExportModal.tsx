import { useState, useEffect } from 'react';
import { Download, Film, X } from 'lucide-react';
import { useConfigStore } from '@/stores/useConfigStore';
import { useKeyframeStore } from '@/stores/useKeyframeStore';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { OptimizedVideo } from '@/core/video-optimized';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const config = useConfigStore();
  const { channels } = useKeyframeStore();
  const { duration } = useTimelineStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [videoQuality, setVideoQuality] = useState(0.95);
  const [exportFps, setExportFps] = useState(30);
  const [videoSupported, setVideoSupported] = useState(true);
  const [supportedCodec, setSupportedCodec] = useState<string>('');

  // Check browser support on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check MediaRecorder support
    if (!('MediaRecorder' in window)) {
      setVideoSupported(false);
      console.warn('MediaRecorder API not supported in this browser');
      return;
    }

    // Check codec support
    const vp9Supported = MediaRecorder.isTypeSupported('video/webm;codecs=vp9');
    const vp8Supported = MediaRecorder.isTypeSupported('video/webm;codecs=vp8');

    if (vp9Supported) {
      setSupportedCodec('VP9');
    } else if (vp8Supported) {
      setSupportedCodec('VP8');
    } else {
      setVideoSupported(false);
      console.warn('WebM video encoding not supported in this browser');
    }
  }, []);

  if (!isOpen) return null;

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('Canvas not found');
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Failed to export image');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mandala-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleExportVideo = async () => {
    setIsRecording(true);
    setRecordingProgress(0);

    try {
      const video = new OptimizedVideo({
        frameRate: exportFps,
        quality: videoQuality,
      });

      // Create offscreen canvas for rendering
      const recordCanvas = document.createElement('canvas');
      recordCanvas.width = config.width;
      recordCanvas.height = config.height;

      const { default: Mandala } = await import('@/core/mandala');
      const { default: Stage } = await import('@/core/stage');
      const { getEasingFunction, interpolateAngle } = await import('@/core/easing');

      const stage = new Stage(recordCanvas) as any;
      const mandala = new Mandala(null) as any;

      // Set up pattern once (reuse for all frames - optimization!)
      if (config.file) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.src = URL.createObjectURL(config.file!);
        });

        const ctx = stage.ctx as CanvasRenderingContext2D;
        let patternImage: HTMLImageElement | HTMLCanvasElement = img;

        // Handle makeTilable - create 2x2 mirrored grid
        if (config.makeTilable) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = img.width * 2;
          tempCanvas.height = img.height * 2;
          const tempCtx = tempCanvas.getContext('2d');

          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);
            tempCtx.save();
            tempCtx.translate(img.width, 0);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(img, -img.width, 0);
            tempCtx.restore();
            tempCtx.save();
            tempCtx.translate(0, img.height);
            tempCtx.scale(1, -1);
            tempCtx.drawImage(tempCanvas, 0, -img.height);
            tempCtx.restore();
            patternImage = tempCanvas;
          }
        }

        const pattern = ctx.createPattern(patternImage, 'repeat');
        if (pattern) {
          mandala.setPattern(pattern);
        }
      }

      // Start recording
      await video.start(recordCanvas);

      const totalFrames = Math.ceil(duration);
      const frameInterval = 1000 / exportFps; // ms per frame

      // Cache stage dimensions (avoid resize per frame - optimization!)
      stage.setWidth(config.width);
      stage.setHeight(config.height);
      stage.setScale(config.scale);

      const interpolateParameter = (param: string, time: number): number => {
        const channel = channels[param as keyof typeof channels];
        const keyframes = channel.keyframes;

        if (keyframes.length === 0) return 0;
        if (keyframes.length === 1) return keyframes[0].value;

        let prevKeyframe = keyframes[0];
        let nextKeyframe = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
          if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
            prevKeyframe = keyframes[i];
            nextKeyframe = keyframes[i + 1];
            break;
          }
        }

        if (time <= keyframes[0].time) return keyframes[0].value;
        if (time >= keyframes[keyframes.length - 1].time)
          return keyframes[keyframes.length - 1].value;

        const timeDelta = nextKeyframe.time - prevKeyframe.time;
        if (timeDelta === 0) return prevKeyframe.value;

        const t = (time - prevKeyframe.time) / timeDelta;
        const easingFn = getEasingFunction(prevKeyframe.easing);
        const easedT = easingFn(t);

        // Use shortest path interpolation for angle parameters
        const isAngleParam = param === 'angle' || param === 'patternAngle';
        if (isAngleParam) {
          return interpolateAngle(prevKeyframe.value, nextKeyframe.value, easedT);
        }

        return prevKeyframe.value + (nextKeyframe.value - prevKeyframe.value) * easedT;
      };

      // Render frames at correct timing
      for (let frame = 0; frame <= totalFrames; frame++) {
        // Interpolate parameters
        const angle = channels.angle.enabled
          ? interpolateParameter('angle', frame)
          : config.angle;
        const offsetX = channels['offset.x'].enabled
          ? interpolateParameter('offset.x', frame)
          : config.offset.x;
        const offsetY = channels['offset.y'].enabled
          ? interpolateParameter('offset.y', frame)
          : config.offset.y;
        const patternScale = channels.patternScale.enabled
          ? interpolateParameter('patternScale', frame)
          : config.patternScale;
        const patternAngle = channels.patternAngle.enabled
          ? interpolateParameter('patternAngle', frame)
          : config.patternAngle;
        const symmetries = channels.symmetries.enabled
          ? interpolateParameter('symmetries', frame)
          : config.symmetries;

        // Update mandala properties
        mandala.setScale(patternScale);
        mandala.setRotation(patternAngle);

        // Render frame
        stage.clear();

        const params = {
          angle,
          offset: { x: offsetX, y: offsetY },
          patternScale,
          patternAngle,
          symmetries,
          backgroundColor: config.backgroundColor,
        };

        mandala.render(stage.ctx, params);

        // Update progress
        setRecordingProgress(Math.round((frame / totalFrames) * 100));

        // Wait for next frame timing (maintains exact frame rate)
        await new Promise((r) => setTimeout(r, frameInterval));
      }

      // Stop recording and save
      await video.save(`mandala-${Date.now()}.webm`);

      setIsRecording(false);
      setRecordingProgress(0);
      onClose();
    } catch (error) {
      console.error('Failed to export video:', error);
      alert(`Failed to export video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsRecording(false);
      setRecordingProgress(0);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => !isRecording && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Export</h2>
            <button
              onClick={onClose}
              disabled={isRecording}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Image Export */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Image</h3>
              <button
                onClick={handleExportPNG}
                disabled={isRecording}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-secondary rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                Export PNG (Current Frame)
              </button>
            </div>

            {/* Video Export */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Video</h3>
                {supportedCodec && (
                  <span className="text-xs text-muted-foreground">Codec: {supportedCodec}</span>
                )}
              </div>

              {!videoSupported && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                  Video export is not supported in this browser. Please use Chrome, Firefox, or Edge.
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Quality</label>
                  <span className="text-sm text-muted-foreground">
                    {(videoQuality * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(parseFloat(e.target.value))}
                  disabled={isRecording}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Frame Rate</label>
                  <span className="text-sm text-muted-foreground">{exportFps} fps</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="1"
                  value={exportFps}
                  onChange={(e) => setExportFps(parseInt(e.target.value))}
                  disabled={isRecording}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleExportVideo}
                disabled={isRecording || !videoSupported}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Film className="w-4 h-4" />
                {isRecording ? `Recording... ${recordingProgress}%` : 'Export Video (WebM)'}
              </button>

              {isRecording && (
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${recordingProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
