/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
export const Easing = {
    // no easing, no acceleration
    linear: (t: number): number => t,
    // accelerating from zero velocity
    easeInQuad: (t: number): number => t * t,
    // decelerating to zero velocity
    easeOutQuad: (t: number): number => t * (2 - t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    // accelerating from zero velocity
    easeInCubic: (t: number): number => t * t * t,
    // decelerating to zero velocity
    easeOutCubic: (t: number): number => --t * t * t + 1,
    // acceleration until halfway, then deceleration
    easeInOutCubic: (t: number): number =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // accelerating from zero velocity
    easeInQuart: (t: number): number => t * t * t * t,
    // decelerating to zero velocity
    easeOutQuart: (t: number): number => 1 - --t * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: (t: number): number =>
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    // accelerating from zero velocity
    easeInQuint: (t: number): number => t * t * t * t * t,
    // decelerating to zero velocity
    easeOutQuint: (t: number): number => 1 + --t * t * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuint: (t: number): number =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
};

// Take N easing functions
export const Compose = (...fs: Array<(t: number) => number>): ((t: number) => number) => {
    const len = fs.length;
    if (len === 0) return (t: number) => t;
    if (len === 1) return fs[0];
    return (t: number) => {
        const index = Math.min(len - 1, Math.floor(t * len));
        return fs[index](t * len - index);
    };
};
export const Invert = (f: (t: number) => number) => (t: number) => f(1 - t);
export const PingPong = (f: (t: number) => number) => Compose(f, Invert(f));

/**
 * Creates a cubic bezier easing function from control points
 * Control points p1 and p2 should be in range [0, 1]
 * This implements the same algorithm as CSS cubic-bezier()
 */
export const createBezierEasing = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): ((t: number) => number) => {
  // Use Newton-Raphson iteration to solve for t given x
  const sampleCurveX = (t: number) => {
    // Cubic bezier formula for x: B(t) = (1-t)³*0 + 3*(1-t)²*t*p1.x + 3*(1-t)*t²*p2.x + t³*1
    return ((1 - 3 * p2.x + 3 * p1.x) * t * t * t) +
           ((3 * p2.x - 6 * p1.x) * t * t) +
           (3 * p1.x * t);
  };

  const sampleCurveY = (t: number) => {
    // Cubic bezier formula for y
    return ((1 - 3 * p2.y + 3 * p1.y) * t * t * t) +
           ((3 * p2.y - 6 * p1.y) * t * t) +
           (3 * p1.y * t);
  };

  const solveCurveX = (x: number) => {
    // Binary search to find t for given x
    let t0 = 0;
    let t1 = 1;
    let t = x;

    for (let i = 0; i < 8; i++) {
      const currentX = sampleCurveX(t);
      const diff = currentX - x;

      if (Math.abs(diff) < 0.001) {
        return t;
      }

      if (diff > 0) {
        t1 = t;
      } else {
        t0 = t;
      }

      t = (t0 + t1) / 2;
    }

    return t;
  };

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return sampleCurveY(solveCurveX(t));
  };
};

/**
 * Gets an easing function from either a string name or bezier definition
 */
export const getEasingFunction = (
  easing: string | { type: 'bezier'; p1: { x: number; y: number }; p2: { x: number; y: number } }
): ((t: number) => number) => {
  if (typeof easing === 'string') {
    return (Easing as Record<string, (t: number) => number>)[easing] || Easing.linear;
  } else if (easing.type === 'bezier') {
    return createBezierEasing(easing.p1, easing.p2);
  }
  return Easing.linear;
};

/**
 * Normalizes an angle difference to take the shortest path around the circle
 * Example: from -181° to 0° will go -181° → -360°/0° (179° clockwise)
 * instead of -181° → 0° (181° counterclockwise)
 */
export const normalizeAngleDifference = (diff: number): number => {
  // Normalize to [-180, 180] range
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
};

/**
 * Interpolates between two angles using the shortest path
 * @param from Starting angle in degrees
 * @param to Ending angle in degrees
 * @param t Interpolation factor [0, 1]
 * @returns Interpolated angle
 */
export const interpolateAngle = (from: number, to: number, t: number): number => {
  const diff = normalizeAngleDifference(to - from);
  return from + diff * t;
};

export default Easing;
