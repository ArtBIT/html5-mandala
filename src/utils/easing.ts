// Easing functions for animation interpolation
// Based on https://easings.net/

type EasingFunction = (t: number) => number;

// Linear
export const linear: EasingFunction = (t) => t;

// Quadratic
export const quadIn: EasingFunction = (t) => t * t;
export const quadOut: EasingFunction = (t) => t * (2 - t);
export const quadInOut: EasingFunction = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

// Cubic
export const cubicIn: EasingFunction = (t) => t * t * t;
export const cubicOut: EasingFunction = (t) => --t * t * t + 1;
export const cubicInOut: EasingFunction = (t) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

// Quartic
export const quartIn: EasingFunction = (t) => t * t * t * t;
export const quartOut: EasingFunction = (t) => 1 - --t * t * t * t;
export const quartInOut: EasingFunction = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

// Quintic
export const quintIn: EasingFunction = (t) => t * t * t * t * t;
export const quintOut: EasingFunction = (t) => 1 + --t * t * t * t * t;
export const quintInOut: EasingFunction = (t) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;

// Sine
export const sineIn: EasingFunction = (t) => 1 - Math.cos((t * Math.PI) / 2);
export const sineOut: EasingFunction = (t) => Math.sin((t * Math.PI) / 2);
export const sineInOut: EasingFunction = (t) =>
  -(Math.cos(Math.PI * t) - 1) / 2;

// Exponential
export const expoIn: EasingFunction = (t) =>
  t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
export const expoOut: EasingFunction = (t) =>
  t === 1 ? 1 : -Math.pow(2, -10 * t) + 1;
export const expoInOut: EasingFunction = (t) => {
  if (t === 0 || t === 1) return t;
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
  return (2 - Math.pow(2, -20 * t + 10)) / 2;
};

// Circular
export const circIn: EasingFunction = (t) => 1 - Math.sqrt(1 - t * t);
export const circOut: EasingFunction = (t) => Math.sqrt(1 - --t * t);
export const circInOut: EasingFunction = (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;

// Back
export const backIn: EasingFunction = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};
export const backOut: EasingFunction = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const backInOut: EasingFunction = (t) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

// Elastic
export const elasticIn: EasingFunction = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};
export const elasticOut: EasingFunction = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};
export const elasticInOut: EasingFunction = (t) => {
  const c5 = (2 * Math.PI) / 4.5;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

// Bounce
export const bounceOut: EasingFunction = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};
export const bounceIn: EasingFunction = (t) => 1 - bounceOut(1 - t);
export const bounceInOut: EasingFunction = (t) =>
  t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2;

// Map of easing function names to functions
const easingFunctions: Record<string, EasingFunction> = {
  linear,
  'quad-in': quadIn,
  'quad-out': quadOut,
  'quad-in-out': quadInOut,
  'cubic-in': cubicIn,
  'cubic-out': cubicOut,
  'cubic-in-out': cubicInOut,
  'quart-in': quartIn,
  'quart-out': quartOut,
  'quart-in-out': quartInOut,
  'quint-in': quintIn,
  'quint-out': quintOut,
  'quint-in-out': quintInOut,
  'sine-in': sineIn,
  'sine-out': sineOut,
  'sine-in-out': sineInOut,
  'expo-in': expoIn,
  'expo-out': expoOut,
  'expo-in-out': expoInOut,
  'circ-in': circIn,
  'circ-out': circOut,
  'circ-in-out': circInOut,
  'back-in': backIn,
  'back-out': backOut,
  'back-in-out': backInOut,
  'elastic-in': elasticIn,
  'elastic-out': elasticOut,
  'elastic-in-out': elasticInOut,
  'bounce-in': bounceIn,
  'bounce-out': bounceOut,
  'bounce-in-out': bounceInOut,
};

// Get easing function by name or custom bezier
export function getEasingFunction(
  easing: string | { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } }
): EasingFunction {
  // If it's a bezier object, create a cubic-bezier function
  if (typeof easing === 'object' && easing.type === 'bezier') {
    return createCubicBezier(easing.p1.x, easing.p1.y, easing.p2.x, easing.p2.y);
  }

  // Otherwise look up the easing function by name (easing is string here)
  const easingName = easing as string;
  return easingFunctions[easingName] || linear;
}

// Create a cubic bezier easing function
// Based on https://github.com/gre/bezier-easing
function createCubicBezier(
  mX1: number,
  mY1: number,
  mX2: number,
  mY2: number
): EasingFunction {
  const NEWTON_ITERATIONS = 4;
  const NEWTON_MIN_SLOPE = 0.001;
  const SUBDIVISION_PRECISION = 0.0000001;
  const SUBDIVISION_MAX_ITERATIONS = 10;

  const kSplineTableSize = 11;
  const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  const sampleValues = new Float32Array(kSplineTableSize);

  function A(aA1: number, aA2: number) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
  }
  function B(aA1: number, aA2: number) {
    return 3.0 * aA2 - 6.0 * aA1;
  }
  function C(aA1: number) {
    return 3.0 * aA1;
  }

  function calcBezier(aT: number, aA1: number, aA2: number) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }

  function getSlope(aT: number, aA1: number, aA2: number) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }

  function binarySubdivide(aX: number, aA: number, aB: number) {
    let currentX,
      currentT,
      i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (
      Math.abs(currentX) > SUBDIVISION_PRECISION &&
      ++i < SUBDIVISION_MAX_ITERATIONS
    );
    return currentT;
  }

  function newtonRaphsonIterate(aX: number, aGuessT: number) {
    for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
      const currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) {
        return aGuessT;
      }
      const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  // Precompute samples table
  for (let i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX(aX: number) {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (
      ;
      currentSample !== lastSample && sampleValues[currentSample] <= aX;
      ++currentSample
    ) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    const dist =
      (aX - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;

    const initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(
        aX,
        intervalStart,
        intervalStart + kSampleStepSize
      );
    }
  }

  return function (t: number): number {
    if (t === 0 || t === 1) {
      return t;
    }
    return calcBezier(getTForX(t), mY1, mY2);
  };
}
