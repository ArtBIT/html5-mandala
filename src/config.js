export default function Config(params) {
    params = params || {};
    this.width = params.width || 2048;
    this.height = params.height || 2048;
    this.scale = params.scale || 4;
    this.angle = params.angle || 0;
    this.offset = params.offset || { h: 0, s: 0, v: 0 };
    this.patternScale = params.patternScale || 1;
    this.patternAngle = params.patternAngle || 0;
    this.symmetries = params.symmetries || 7;
}
