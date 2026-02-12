import type { PresetData } from '@/stores/usePresetStore';
import type { ParameterKey, ParameterChannel } from '@/stores/useKeyframeStore';

const defaultChannel = (value: number): ParameterChannel => ({
  keyframes: [{ time: 0, value, easing: 'linear' }],
  enabled: true,
});

const defaultChannels = (): Record<ParameterKey, ParameterChannel> => ({
  'angle': defaultChannel(0),
  'offset.x': defaultChannel(0),
  'offset.y': defaultChannel(0),
  'patternScale': defaultChannel(1),
  'patternAngle': defaultChannel(0),
  'symmetries': defaultChannel(7),
});

/**
 * Slow continuous rotation with gentle pattern counter-rotation.
 * Creates a mesmerizing spinning mandala effect.
 */
const slowSpin: PresetData = {
  name: 'Slow Spin',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 1, patternAngle: 0,
    symmetries: 8, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'linear' },
        { time: 300, value: 360, easing: 'linear' },
      ],
      enabled: true,
    },
    'patternAngle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 150, value: -90, easing: 'easeInOutQuad' },
        { time: 300, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'symmetries': defaultChannel(8),
  },
  timeline: { fps: 30, loop: true, duration: 300 },
};

/**
 * Pattern scale pulsing in and out like breathing.
 * Combined with slow offset drift for organic movement.
 */
const breathingMandala: PresetData = {
  name: 'Breathing',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 0.8, patternAngle: 0,
    symmetries: 6, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'patternScale': {
      keyframes: [
        { time: 0, value: 0.6, easing: 'easeInOutCubic' },
        { time: 90, value: 1.8, easing: 'easeInOutCubic' },
        { time: 180, value: 0.6, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 90, value: 45, easing: 'easeInOutQuad' },
        { time: 180, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'symmetries': defaultChannel(6),
  },
  timeline: { fps: 30, loop: true, duration: 180 },
};

/**
 * Pattern offset drifts in a circular path while the mandala rotates,
 * creating a kaleidoscope-like wandering effect.
 */
const kaleidoscopeDrift: PresetData = {
  name: 'Kaleidoscope Drift',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 1.2, patternAngle: 0,
    symmetries: 10, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'offset.x': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 90, value: 0.4, easing: 'easeInOutQuad' },
        { time: 180, value: 0, easing: 'easeInOutQuad' },
        { time: 270, value: -0.4, easing: 'easeInOutQuad' },
        { time: 360, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'offset.y': {
      keyframes: [
        { time: 0, value: -0.3, easing: 'easeInOutQuad' },
        { time: 90, value: 0, easing: 'easeInOutQuad' },
        { time: 180, value: 0.3, easing: 'easeInOutQuad' },
        { time: 270, value: 0, easing: 'easeInOutQuad' },
        { time: 360, value: -0.3, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 180, value: 90, easing: 'easeInOutQuad' },
        { time: 360, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'symmetries': defaultChannel(10),
    'patternScale': defaultChannel(1.2),
  },
  timeline: { fps: 30, loop: true, duration: 360 },
};

/**
 * Angle and pattern angle rotate in opposite directions while
 * scale pulses, creating a hypnotic vortex tunnel effect.
 */
const hypnoticVortex: PresetData = {
  name: 'Hypnotic Vortex',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 1, patternAngle: 0,
    symmetries: 12, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'linear' },
        { time: 300, value: 360, easing: 'linear' },
      ],
      enabled: true,
    },
    'patternAngle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 150, value: -180, easing: 'easeInOutQuad' },
        { time: 300, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'patternScale': {
      keyframes: [
        { time: 0, value: 0.8, easing: 'easeInOutQuad' },
        { time: 150, value: 1.8, easing: 'easeInOutQuad' },
        { time: 300, value: 0.8, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'symmetries': defaultChannel(12),
  },
  timeline: { fps: 30, loop: true, duration: 300 },
};

/**
 * Symmetries morph between low and high counts while scale
 * and rotation shift, like a flower blooming and folding.
 */
const cosmicBloom: PresetData = {
  name: 'Cosmic Bloom',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 0.5, patternAngle: 0,
    symmetries: 3, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'symmetries': {
      keyframes: [
        { time: 0, value: 3, easing: 'easeInOutCubic' },
        { time: 120, value: 16, easing: 'easeInOutCubic' },
        { time: 240, value: 3, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
    'patternScale': {
      keyframes: [
        { time: 0, value: 0.4, easing: 'easeInOutCubic' },
        { time: 120, value: 1.6, easing: 'easeInOutCubic' },
        { time: 240, value: 0.4, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 120, value: 120, easing: 'easeInOutQuad' },
        { time: 240, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
  },
  timeline: { fps: 30, loop: true, duration: 240 },
};

/**
 * Rapid pendulum swing on offset.x with high symmetry,
 * creating a shimmering back-and-forth wave effect.
 */
const pendulumWave: PresetData = {
  name: 'Pendulum Wave',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 1, patternAngle: 0,
    symmetries: 16, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'offset.x': {
      keyframes: [
        { time: 0, value: -0.6, easing: 'easeInOutQuad' },
        { time: 60, value: 0.6, easing: 'easeInOutQuad' },
        { time: 120, value: -0.6, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'offset.y': {
      keyframes: [
        { time: 0, value: 0.2, easing: 'easeInOutCubic' },
        { time: 60, value: -0.2, easing: 'easeInOutCubic' },
        { time: 120, value: 0.2, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
    'patternAngle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 60, value: 60, easing: 'easeInOutQuad' },
        { time: 120, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'symmetries': defaultChannel(16),
  },
  timeline: { fps: 30, loop: true, duration: 120 },
};

/**
 * Everything animates at once at different rates: rotation, pattern rotation,
 * scale, offset, and symmetries all drift slowly creating an ever-evolving form.
 */
const organicDream: PresetData = {
  name: 'Organic Dream',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 1, patternAngle: 0,
    symmetries: 5, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 240, value: 72, easing: 'easeInOutQuad' },
        { time: 480, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'patternAngle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 240, value: -45, easing: 'easeInOutQuad' },
        { time: 480, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'patternScale': {
      keyframes: [
        { time: 0, value: 0.8, easing: 'easeInOutCubic' },
        { time: 160, value: 1.5, easing: 'easeInOutCubic' },
        { time: 320, value: 0.6, easing: 'easeInOutCubic' },
        { time: 480, value: 0.8, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
    'offset.x': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 160, value: 0.3, easing: 'easeInOutQuad' },
        { time: 320, value: -0.2, easing: 'easeInOutQuad' },
        { time: 480, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'offset.y': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 120, value: -0.25, easing: 'easeInOutQuad' },
        { time: 360, value: 0.25, easing: 'easeInOutQuad' },
        { time: 480, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'symmetries': {
      keyframes: [
        { time: 0, value: 5, easing: 'easeInOutCubic' },
        { time: 240, value: 9, easing: 'easeInOutCubic' },
        { time: 480, value: 5, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
  },
  timeline: { fps: 30, loop: true, duration: 480 },
};

/**
 * Deep zoom into the pattern center and back out,
 * with slow rotation creating a fractal tunnel illusion.
 */
const zoomTunnel: PresetData = {
  name: 'Zoom Tunnel',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 0.2, patternAngle: 0,
    symmetries: 7, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'patternScale': {
      keyframes: [
        { time: 0, value: 0.15, easing: 'easeInOutQuart' },
        { time: 180, value: 3.5, easing: 'easeInOutQuart' },
        { time: 360, value: 0.15, easing: 'easeInOutQuart' },
      ],
      enabled: true,
    },
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 180, value: 180, easing: 'easeInOutQuad' },
        { time: 360, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'patternAngle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutCubic' },
        { time: 180, value: 90, easing: 'easeInOutCubic' },
        { time: 360, value: 0, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
  },
  timeline: { fps: 30, loop: true, duration: 360 },
};

/**
 * Symmetries ramp up from 2 to 32 with accelerating easing,
 * like a crystal forming and becoming infinitely detailed.
 */
const crystallize: PresetData = {
  name: 'Crystallize',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 1.2, patternAngle: 0,
    symmetries: 2, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    'symmetries': {
      keyframes: [
        { time: 0, value: 2, easing: 'easeInQuart' },
        { time: 200, value: 32, easing: 'easeOutQuart' },
        { time: 400, value: 2, easing: 'easeInQuart' },
      ],
      enabled: true,
    },
    'angle': {
      keyframes: [
        { time: 0, value: 0, easing: 'linear' },
        { time: 400, value: 360, easing: 'linear' },
      ],
      enabled: true,
    },
    'patternScale': {
      keyframes: [
        { time: 0, value: 1.5, easing: 'easeInOutCubic' },
        { time: 200, value: 0.5, easing: 'easeInOutCubic' },
        { time: 400, value: 1.5, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
    'patternAngle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 200, value: -60, easing: 'easeInOutQuad' },
        { time: 400, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
  },
  timeline: { fps: 30, loop: true, duration: 400 },
};

/**
 * Figure-8 / lissajous offset path with pattern rotation,
 * creating a fluid, organic wobble.
 */
const lissajousWobble: PresetData = {
  name: 'Lissajous Wobble',
  timestamp: 0,
  config: {
    width: 2048, height: 2048, scale: 4,
    angle: 0, backgroundColor: '#000',
    offset: { x: 0, y: 0 },
    patternScale: 1, patternAngle: 0,
    symmetries: 7, makeTilable: false,
  },
  keyframes: {
    ...defaultChannels(),
    // x completes one full cycle
    'offset.x': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 75, value: 0.5, easing: 'easeInOutQuad' },
        { time: 150, value: 0, easing: 'easeInOutQuad' },
        { time: 225, value: -0.5, easing: 'easeInOutQuad' },
        { time: 300, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    // y completes two full cycles (2:1 lissajous)
    'offset.y': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 37, value: 0.35, easing: 'easeInOutQuad' },
        { time: 75, value: 0, easing: 'easeInOutQuad' },
        { time: 112, value: -0.35, easing: 'easeInOutQuad' },
        { time: 150, value: 0, easing: 'easeInOutQuad' },
        { time: 187, value: 0.35, easing: 'easeInOutQuad' },
        { time: 225, value: 0, easing: 'easeInOutQuad' },
        { time: 262, value: -0.35, easing: 'easeInOutQuad' },
        { time: 300, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'patternAngle': {
      keyframes: [
        { time: 0, value: 0, easing: 'easeInOutQuad' },
        { time: 150, value: 120, easing: 'easeInOutQuad' },
        { time: 300, value: 0, easing: 'easeInOutQuad' },
      ],
      enabled: true,
    },
    'patternScale': {
      keyframes: [
        { time: 0, value: 0.8, easing: 'easeInOutCubic' },
        { time: 150, value: 1.4, easing: 'easeInOutCubic' },
        { time: 300, value: 0.8, easing: 'easeInOutCubic' },
      ],
      enabled: true,
    },
  },
  timeline: { fps: 30, loop: true, duration: 300 },
};

export const defaultPresets: Record<string, PresetData> = {
  'Slow Spin': slowSpin,
  'Breathing': breathingMandala,
  'Kaleidoscope Drift': kaleidoscopeDrift,
  'Hypnotic Vortex': hypnoticVortex,
  'Cosmic Bloom': cosmicBloom,
  'Pendulum Wave': pendulumWave,
  'Organic Dream': organicDream,
  'Zoom Tunnel': zoomTunnel,
  'Crystallize': crystallize,
  'Lissajous Wobble': lissajousWobble,
};
