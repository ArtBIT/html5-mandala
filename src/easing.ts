/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
export const Easing = {
    // no easing, no acceleration
    linear: t => t,
    // accelerating from zero velocity
    easeInQuad: t => t * t,
    // decelerating to zero velocity
    easeOutQuad: t => t * (2 - t),
    // acceleration until halfway, then deceleration
    easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    // accelerating from zero velocity
    easeInCubic: t => t * t * t,
    // decelerating to zero velocity
    easeOutCubic: t => --t * t * t + 1,
    // acceleration until halfway, then deceleration
    easeInOutCubic: t =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // accelerating from zero velocity
    easeInQuart: t => t * t * t * t,
    // decelerating to zero velocity
    easeOutQuart: t => 1 - --t * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuart: t =>
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    // accelerating from zero velocity
    easeInQuint: t => t * t * t * t * t,
    // decelerating to zero velocity
    easeOutQuint: t => 1 + --t * t * t * t * t,
    // acceleration until halfway, then deceleration
    easeInOutQuint: t =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
};

// Take N easing functions
export const Compose = (...fs) => {
    const len = fs.length;
    if (len === 0) return t => t;
    if (len === 1) return fs[0];
    return t => {
        const index = Math.min(len - 1, Math.floor(t * len));
        return fs[index](t * len - index);
    };
};
export const Invert = f => t => f(1 - t);
export const PingPong = f => Compose(f, Invert(f));

export default Easing;
